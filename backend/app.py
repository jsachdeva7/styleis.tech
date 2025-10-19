from flask import Flask, request, jsonify
from flask_cors import CORS
from routes import home_bp, remove_bg_bp, clothes_bp, weather_bp, locations_bp, donations_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(home_bp)
app.register_blueprint(remove_bg_bp, url_prefix='/api/images')
app.register_blueprint(clothes_bp, url_prefix='/api/clothes')
app.register_blueprint(weather_bp, url_prefix='/api/weather')
app.register_blueprint(locations_bp, url_prefix='/api/locations')
app.register_blueprint(donations_bp, url_prefix='/api/donations')


@app.route("/", methods=["GET"])
def index():
    return "Welcome to the Backend API!"


# Example POST endpoint
@app.route("/echo", methods=["POST"])
def echo():
    """
    Example endpoint to test POST requests.
    Expects JSON payload: { "message": "hello" }
    """
    data = request.json
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field"}), 400

    message = data["message"]
    return jsonify({"echo": message})


if __name__ == "__main__":
    # Run the app on http://127.0.0.1:5000
    app.run(debug=True)

