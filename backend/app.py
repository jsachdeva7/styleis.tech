from flask import Flask, request, jsonify
from flask_cors import CORS
from routes import home_bp, clothes_bp, weather_bp, locations_bp, donations_bp
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS to allow all origins
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

# Log all requests
@app.before_request
def log_request_info():
    logger.info(f'Request: {request.method} {request.path}')
    if request.args:
        logger.info(f'Query params: {dict(request.args)}')

@app.after_request
def log_response_info(response):
    logger.info(f'Response: {response.status_code}')
    return response

# Register blueprints
app.register_blueprint(home_bp)

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
    import os
    port = int(os.environ.get("PORT", 10000))  # use Render's assigned port
    logger.info(f"🚀 Starting Flask app on port {port}")
    logger.info(f"🌍 Environment: {'Production' if os.environ.get('RENDER') else 'Development'}")
    app.run(host="0.0.0.0", port=port, debug=True)
