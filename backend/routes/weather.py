from flask import Blueprint, request, jsonify
import requests
import os

weather_bp = Blueprint('weather', __name__)

@weather_bp.route("/", methods=["GET"])
def get_weather():


    """Get weather information"""
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    # Validate parameters
    if not lat or not lon:
        return jsonify({"error": "Missing latitude or longitude"}), 400

    api_key = "3521e8572db36311ea9db2471a556c51"
    if not api_key:
        return jsonify({"error": "Missing API key"}), 500

    try:
        # Call the OpenWeatherMap API
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&units=metric&appid={api_key}"
        )

        response = requests.get(url)
        data = response.json()

        # Extract useful info
        temperature = data["main"]["temp"]
        city = data.get("name", "Unknown")

        return jsonify({
            "location": city,
            "temperature": temperature
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


    #print("GET /api/weather hit")
    #return jsonify({"message": "GET /api/weather hit"})

