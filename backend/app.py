from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/", methods=["GET"])

@app.route("/donation_centers", methods=["POST"])


def home():
    return "Flask app is running!"

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

