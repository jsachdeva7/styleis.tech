from flask import Blueprint, request, jsonify
import requests
import geocoder
import os

weather_bp = Blueprint('weather', __name__)

@weather_bp.route("/", methods=["GET"])
def get_weather():


    """Get weather information"""
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    # Validate parameters
    if not lat or not lon:
        try:
            g = geocoder.ip('me')  # approximate location from public IP
            lat, lon = g.latlng
            print(f"Detected location from IP: {lat}, {lon}")
        except Exception as e:
            return jsonify({"error": f"Could not detect location: {str(e)}"}), 500
        #return jsonify({"error": "Missing latitude or longitude"}), 400

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
        weather_main = data["weather"][0]["main"] if data.get("weather") else "Clear"
        weather_description = data["weather"][0]["description"] if data.get("weather") else ""
        
        # Map weather conditions to emojis
        weather_emoji_map = {
            "Clear": "☀️",
            "Clouds": "☁️",
            "Rain": "🌧️",
            "Drizzle": "🌦️",
            "Thunderstorm": "⛈️",
            "Snow": "❄️",
            "Mist": "🌫️",
            "Fog": "🌫️",
            "Haze": "🌫️"
        }
        weather_emoji = weather_emoji_map.get(weather_main, "🌤️")

        return jsonify({
            "success": True,
            "location": city,
            "temperature": round((temperature * 9/5) + 32),  # Convert to Fahrenheit and round to integer
            "weather_main": weather_main,
            "weather_description": weather_description,
            "weather_emoji": weather_emoji
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


    #print("GET /api/weather hit")
    #return jsonify({"message": "GET /api/weather hit"})

