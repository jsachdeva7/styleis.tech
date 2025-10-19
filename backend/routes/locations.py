from flask import Blueprint, request, jsonify
import requests
from math import radians, cos, sin, asin, sqrt
import time

locations_bp = Blueprint('locations', __name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8  # miles
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

def fetch_clothing_donations(lat, lon, radius=10000):
    query = f"""
    [out:json][timeout:25];
    (
      node["social_facility"="clothing_bank"](around:{radius},{lat},{lon});
      node["amenity"="give_box"](around:{radius},{lat},{lon});
      node["shop"="charity"](around:{radius},{lat},{lon});
      node["social_facility"="charity"](around:{radius},{lat},{lon});
      node["amenity"="donation"](around:{radius},{lat},{lon});
      way["social_facility"="clothing_bank"](around:{radius},{lat},{lon});
      way["amenity"="give_box"](around:{radius},{lat},{lon});
      way["shop"="charity"](around:{radius},{lat},{lon});
      way["social_facility"="charity"](around:{radius},{lat},{lon});
      way["amenity"="donation"](around:{radius},{lat},{lon});
    );
    out center;
    """
    try:
        resp = requests.post(OVERPASS_URL, data=query, headers={"Content-Type": "text/plain"})
        resp.raise_for_status()
    except requests.RequestException as e:
        print("Error fetching from Overpass API:", e)
        return []

    data = resp.json()
    results = []

    for el in data.get("elements", []):
        tags = el.get("tags", {})
        street = tags.get("addr:street")
        city = tags.get("addr:city")
        if not street and not city:
            continue
        lat_val = el.get("lat") or el.get("center", {}).get("lat")
        lon_val = el.get("lon") or el.get("center", {}).get("lon")
        if lat_val is None or lon_val is None:
            continue
        results.append({
            "name": tags.get("name", "Unnamed Donation"),
            "address": f"{street or ''}, {city or ''}".strip(", "),
            "distance_miles": round(haversine(lat, lon, lat_val, lon_val), 2)
        })

    results.sort(key=lambda x: x["distance_miles"])
    return results[:5]

@locations_bp.route("/", methods=["GET"])
def get_donation_locations():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        return jsonify({"error": "Missing 'lat' or 'lon' query parameters"}), 400

    radius = 10000
    max_radius = 1000000
    centers = []

    while len(centers) < 5 and radius <= max_radius:
        centers = fetch_clothing_donations(lat, lon, radius)
        if len(centers) >= 5:
            break
        radius *= 2
        time.sleep(1)

    return jsonify(centers)
