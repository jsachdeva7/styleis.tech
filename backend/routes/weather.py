from flask import Blueprint, request, jsonify

weather_bp = Blueprint('weather', __name__)

@weather_bp.route("", methods=["GET"])
def get_weather():
    """Get weather information"""
    print("GET /api/weather hit")
    return jsonify({"message": "GET /api/weather hit"})

