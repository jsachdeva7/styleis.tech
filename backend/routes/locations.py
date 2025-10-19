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

def fetch_clothing_donations(lat, lon, radius, query):
    # Map the query to OSM tags
    query_tags = {
        "clothing": [
            'node["social_facility"="clothing_bank"]',
            'node["amenity"="give_box"]',
            'node["shop"="charity"]',
            'node["social_facility"="charity"]',
            'node["amenity"="donation"]',
            'way["social_facility"="clothing_bank"]',
            'way["amenity"="give_box"]',
            'way["shop"="charity"]',
            'way["social_facility"="charity"]',
            'way["amenity"="donation"]'
        ],
        # You can add more query types here if needed
    }

    elements = query_tags.get(query.lower())
    if not elements:
        return []

    # Build Overpass query string
    overpass_query = f"[out:json][timeout:25];(" + ";".join(f"{el}(around:{radius},{lat},{lon})" for el in elements) + ");out center;"

    resp = requests.post(OVERPASS_URL, data=overpass_query, headers={"Content-Type": "text/plain"})
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
            "lat": lat_val,
            "lon": lon_val,
            "distance": haversine(lat, lon, lat_val, lon_val)
        })

    # Sort by distance
    results.sort(key=lambda x: x["distance"])
    return results

@locations_bp.route("", methods=["GET"])
def get_donation_locations():
    """Fetch nearby donation locations"""
    print("GET /api/locations hit")
    
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    query = request.args.get("query", default="clothing")

    if lat is None or lon is None:
        return jsonify({"error": "Missing 'lat' or 'lon' query parameters"}), 400

    radius = 10000
    max_radius = 1000000
    centers = []

    while len(centers) < 5 and radius <= max_radius:
        centers = fetch_clothing_donations(lat, lon, radius, query)
        if len(centers) >= 5:
            break
        radius *= 2
        time.sleep(1)

    return jsonify(centers[:5])

