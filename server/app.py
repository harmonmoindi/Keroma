import os
import re
from contextlib import closing
from datetime import timedelta

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