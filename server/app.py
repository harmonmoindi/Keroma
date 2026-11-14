import os
from contextlib import closing

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)


def get_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])


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