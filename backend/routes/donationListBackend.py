from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from math import radians, cos, sin, asin, sqrt
import time

app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can fetch data

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Haversine formula to calculate distance in miles
def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8  # Earth radius in miles
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * asin(sqrt(a))
    return R * c

def fetch_clothing_donations(lat, lon, radius):
    overpass_query = f"""
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
    resp = requests.post(OVERPASS_URL, data=overpass_query, headers={"Content-Type": "text/plain"})
    data = resp.json()

    results = []
    for el in data.get("elements", []):
        tags = el.get("tags", {})
        street = tags.get("addr:street")
        city = tags.get("addr:city")

        # Skip locations without an address
        if not street and not city:
            continue

        lat_val = el.get("lat") or el.get("center", {}).get("lat")
        lon_val = el.get("lon") or el.get("center", {}).get("lon")
        if lat_val is None or lon_val is None:
            continue

        distance = haversine(lat, lon, lat_val, lon_val)
        results.append({
            "name": tags.get("name", "Unnamed Clothing Donation"),
            "address": f"{street or ''}, {city or ''}".strip(", "),
            "lat": lat_val,
            "lon": lon_val,
            "distance": distance
        })

    # Sort by distance
    results.sort(key=lambda x: x["distance"])
    return results

@app.route("/donation_centers", methods=["POST"])
def donation_centers():
    data = request.json
    lat = data.get("lat")
    lon = data.get("lon")

    if lat is None or lon is None:
        return jsonify({"error": "Missing 'lat' or 'lon' in request body"}), 400

    # Dynamic radius expansion
    radius = 10000  # start with 10 km
    max_radius = 1000000  # 1000 km max
    centers = []

    while len(centers) < 5 and radius <= max_radius:
        centers = fetch_clothing_donations(lat, lon, radius)
        if len(centers) >= 5:
            break
        radius *= 2
        time.sleep(1)  # slight delay to avoid overloading Overpass API

    # Return only the top 5 nearest
    return jsonify(centers[:5])

if __name__ == "__main__":
    app.run(debug=True)