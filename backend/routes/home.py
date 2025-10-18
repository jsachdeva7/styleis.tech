from flask import Blueprint, jsonify, send_from_directory
import os

# Create a blueprint for home routes
home_bp = Blueprint('home', __name__)

@home_bp.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask!"})

@home_bp.route("/")
def serve():
    return send_from_directory(os.path.join(os.path.dirname(__file__), "../../frontend/dist"), "index.html")

@home_bp.errorhandler(404)
def not_found(e):
    return send_from_directory(os.path.join(os.path.dirname(__file__), "../../frontend/dist"), "index.html")
