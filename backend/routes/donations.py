from flask import Blueprint, request, jsonify
import requests
from math import radians, cos, sin, asin, sqrt
import time

donations_bp = Blueprint('donations', __name__)

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
    # Format: [out:json][timeout:25];(node["key"="value"](around:radius,lat,lon);way[...];);out center;
    query_parts = [f"{el}(around:{int(radius)},{lat},{lon})" for el in elements]
    overpass_query = f'[out:json][timeout:25];({";".join(query_parts)};);out center;'
    
    print(f"Overpass query being sent: {overpass_query}")  # Debug logging
    print(f"Query length: {len(overpass_query)} chars, Radius: {radius}m")  # Debug

    try:
        resp = requests.post(OVERPASS_URL, data=overpass_query, headers={"Content-Type": "text/plain"}, timeout=30)
        
        # Check if request was successful
        if resp.status_code != 200:
            print(f"Overpass API returned status code: {resp.status_code}")
            print(f"Full response: {resp.text}")  # Print full response to see error details
            return []
        
        # Check if response has content
        if not resp.text or resp.text.strip() == "":
            print("Overpass API returned empty response")
            return []
        
        data = resp.json()
    except requests.exceptions.JSONDecodeError as e:
        print(f"Failed to parse Overpass API response as JSON: {e}")
        print(f"Response text: {resp.text[:500]}")  # Print first 500 chars for debugging
        return []
    except requests.exceptions.RequestException as e:
        print(f"Request to Overpass API failed: {e}")
        return []

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

# ---------- GET endpoint with query parameter ----------
@donations_bp.route("/locations", methods=["GET"])
def donation_centers():
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