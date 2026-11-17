import os
import re
from contextlib import closing
from datetime import timedelta
import hashlib
import secrets
import threading

import requests

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from psycopg2 import errors
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

app = Flask(__name__)

# the hosting platform sits in front of the app; this makes Flask see the visitor's real IP
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1)

# only your own frontend may call the API (comma-separated list)
allowed_origins = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
CORS(app, origins=allowed_origins)

app.config["JWT_SECRET_KEY"] = os.environ["JWT_SECRET_KEY"]
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
JWTManager(app)

limiter = Limiter(get_remote_address, app=app, storage_uri="memory://")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
RESET_MINUTES = 30
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


@app.errorhandler(429)
def too_many_requests(error):
    return jsonify({"error": str(error.description)}), 429


def get_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def read_credentials():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    return email, password

def hash_token(token):
    return hashlib.sha256(token.encode()).hexdigest()


def send_email(to_email, subject, html):
    api_key = os.environ.get("BREVO_API_KEY")
    sender_email = os.environ.get("MAIL_SENDER_EMAIL")
    if not api_key or not sender_email:
        app.logger.warning("Email is not configured, so nothing was sent to %s", to_email)
        return
    try:
        resp = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={"api-key": api_key, "accept": "application/json"},
            json={
                "sender": {"name": "Keroma", "email": sender_email},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html,
            },
            timeout=10,
        )
        resp.raise_for_status()
    except requests.RequestException:
        app.logger.exception("Could not send email to %s", to_email)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/meals")
def get_meals():
    query = """
        SELECT m.id, m.name, m.category, m.image_url,
               COALESCE(
                 array_agg(t.name) FILTER (WHERE t.name IS NOT NULL),
                 '{}'
               ) AS tags
        FROM meals m
        LEFT JOIN meal_tags mt ON mt.meal_id = m.id
        LEFT JOIN tags t ON t.id = mt.tag_id
        GROUP BY m.id
        ORDER BY m.id
    """
    with closing(get_connection()) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query)
            meals = cur.fetchall()
    return jsonify(meals)


@app.route("/api/signup", methods=["POST"])
@limiter.limit(
    "10 per hour",
    error_message="Too many sign-up attempts. Please try again later.",
)
def signup():
    email, password = read_credentials()

    if not EMAIL_RE.match(email):
        return jsonify({"error": "Enter a valid email address."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    with closing(get_connection()) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            try:
                cur.execute(
                    "INSERT INTO users (email, password_hash) "
                    "VALUES (%s, %s) RETURNING id, email",
                    (email, generate_password_hash(password)),
                )
            except errors.UniqueViolation:
                conn.rollback()
                return jsonify({"error": "That email is already registered."}), 409
            user = cur.fetchone()
        conn.commit()

    token = create_access_token(identity=str(user["id"]))
    return jsonify({"token": token, "user": user}), 201


@app.route("/api/login", methods=["POST"])
@limiter.limit(
    "5 per 2 minutes",
    error_message="Too many login attempts. Please wait 2 minutes and try again.",
)
def login():
    email, password = read_credentials()

    with closing(get_connection()) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, email, password_hash FROM users WHERE email = %s",
                (email,),
            )
            user = cur.fetchone()

    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password."}), 401

    token = create_access_token(identity=str(user["id"]))
    return jsonify({"token": token, "user": {"id": user["id"], "email": user["email"]}})


@app.route("/api/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    with closing(get_connection()) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id, email FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
    if user is None:
        return jsonify({"error": "User not found."}), 404
    return jsonify(user)

@app.route("/api/forgot-password", methods=["POST"])
@limiter.limit(
    "5 per hour",
    error_message="Too many reset requests. Please try again later.",
)
def forgot_password():
    email, _ = read_credentials()
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Enter a valid email address."}), 400

    with closing(get_connection()) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cur.fetchone()

            if user:
                token = secrets.token_urlsafe(32)
                # only the newest link should work
                cur.execute(
                    "DELETE FROM password_resets WHERE user_id = %s AND used_at IS NULL",
                    (user["id"],),
                )
                cur.execute(
                    "INSERT INTO password_resets (user_id, token_hash, expires_at) "
                    "VALUES (%s, %s, now() + %s * interval '1 minute')",
                    (user["id"], hash_token(token), RESET_MINUTES),
                )
                conn.commit()

                link = f"{FRONTEND_URL}/reset-password?token={token}"
                if app.debug and not os.environ.get("BREVO_API_KEY"):
                    app.logger.info("DEV ONLY reset link for %s: %s", email, link)

                html = (
                    "<p>Hi,</p>"
                    "<p>We got a request to reset your Keroma password. "
                    f"This link works for {RESET_MINUTES} minutes:</p>"
                    f'<p><a href="{link}">Reset my password</a></p>'
                    "<p>If you didn't ask for this, you can ignore this email. "
                    "Your password won't change.</p>"
                )
                # sent in the background so the reply takes the same time either way
                threading.Thread(
                    target=send_email,
                    args=(email, "Reset your Keroma password", html),
                    daemon=True,
                ).start()

    return jsonify(
        {"message": "If that email has an account, a reset link is on its way."}
    )


@app.route("/api/reset-password", methods=["POST"])
@limiter.limit(
    "10 per hour",
    error_message="Too many attempts. Please try again later.",
)
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token") or ""
    password = data.get("password") or ""

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    with closing(get_connection()) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, user_id FROM password_resets "
                "WHERE token_hash = %s AND used_at IS NULL AND expires_at > now() "
                "FOR UPDATE",
                (hash_token(token),),
            )
            row = cur.fetchone()
            if row is None:
                return jsonify({
                    "error": "This reset link is invalid or has expired. Please request a new one."
                }), 400

            cur.execute(
                "UPDATE users SET password_hash = %s WHERE id = %s",
                (generate_password_hash(password), row["user_id"]),
            )
            cur.execute(
                "UPDATE password_resets SET used_at = now() WHERE id = %s",
                (row["id"],),
            )
        conn.commit()

    return jsonify({"message": "Password updated. You can now log in."})