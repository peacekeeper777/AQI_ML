from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load trained models
with open("models/aqi_model.pkl", "rb") as file:
    aqi_data = pickle.load(file)

reg_model = aqi_data["reg_model"]
class_model = aqi_data["class_model"]
feature_names = aqi_data["feature_names"]

imputer_stats = aqi_data["imputer_stats"]
scaler_mean = aqi_data["scaler_mean"]
scaler_scale = aqi_data["scaler_scale"]

pollutants = [
    "PM2.5", "PM10", "NO", "NO2", "NOx", "NH3",
    "CO", "SO2", "O3", "Benzene", "Toluene", "Xylene"
]

# Home route
@app.route("/")
def home():
    return "AQI Prediction API is running!"

# Prediction route
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "City" not in data or "Date" not in data:
        return jsonify({"error": "City and Date are required"}), 400

    values = {"City": data["City"], "Date": data["Date"]}

    for p in pollutants:
        value = data.get(p)
        values[p] = float(value) if value not in [None, ""] else np.nan

    df = pd.DataFrame([values])

    df["Date"] = pd.to_datetime(df["Date"])
    df["Year"] = df["Date"].dt.year
    df["Month"] = df["Date"].dt.month
    df["Day"] = df["Date"].dt.day

    df = pd.get_dummies(df, columns=["City"], dtype=int)
    df = df.drop(columns=["Date"])
    df = df.reindex(columns=feature_names, fill_value=0)

    df = df.fillna(pd.Series(imputer_stats, index=feature_names))

    x = (df - scaler_mean) / scaler_scale

    predicted_aqi = reg_model.predict(x)[0]
    predicted_category = class_model.predict(x)[0]

    return jsonify({
        "predicted_aqi": round(float(predicted_aqi), 2),
        "aqi_category": str(predicted_category)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))