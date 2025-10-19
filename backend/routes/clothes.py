from flask import Blueprint, request, jsonify

clothes_bp = Blueprint('clothes', __name__)

@clothes_bp.route("", methods=["GET"])
def get_all_clothes():
    """Fetch all clothes - frontend will filter by category"""
    print("GET /api/clothes hit")
    return jsonify({"message": "GET /api/clothes hit"})

@clothes_bp.route("", methods=["POST"])
def add_clothing_item():
    """Upload individual clothing item with image, condition, category"""
    print("POST /api/clothes hit")
    # Expected: image file, condition, category
    return jsonify({"message": "POST /api/clothes hit"})

@clothes_bp.route("/ootd", methods=["POST"])
def create_ootd():
    """Create outfit of the day with selected clothing IDs"""
    print("POST /api/clothes/ootd hit")
    # Expected: list of clothing IDs
    return jsonify({"message": "POST /api/clothes/ootd hit"})

@clothes_bp.route("/jail", methods=["GET"])
def get_jail_clothes():
    """Get clothes in 'jail' - the five least used items"""
    print("GET /api/clothes/jail hit")
    return jsonify({"message": "GET /api/clothes/jail hit"})

@clothes_bp.route("/jail/takeout", methods=["POST"])
def takeout_from_jail():
    """Take a clothing item out of jail"""
    print("POST /api/clothes/jail/takeout hit")
    # Expected: clothing ID
    return jsonify({"message": "POST /api/clothes/jail/takeout hit"})

@clothes_bp.route("/jail/donate", methods=["POST"])
def confirm_donation():
    """Confirm that a clothing item will be donated"""
    print("POST /api/clothes/jail/donate hit")
    # Expected: clothing ID
    return jsonify({"message": "POST /api/clothes/jail/donate hit"})

@clothes_bp.route("/donations", methods=["GET"])
def get_donation_basket():
    """See the donation basket - items marked for donation"""
    print("GET /api/clothes/donations hit")
    return jsonify({"message": "GET /api/clothes/donations hit"})

