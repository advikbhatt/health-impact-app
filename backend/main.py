# main.py
import os
import datetime
import requests
import openai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("PERPLEXITY_API_KEY")
AQI_TOKEN = os.getenv("AQI_TOKEN")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Models
# ---------------------------
class UserData(BaseModel):
    name: str
    lat: float
    lon: float

class ReportRequest(BaseModel):
    lat: float
    lon: float
    name: str

# ---------------------------
# Routes
# ---------------------------
@app.get("/live_aqi")
def live_aqi(lat: float, lon: float):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={AQI_TOKEN}"
    res = requests.get(url).json()
    if res.get("status") != "ok":
        raise HTTPException(status_code=404, detail="AQI data not found")

    data = res["data"]

    components = {}
    for k, v in data.get("iaqi", {}).items():
        if isinstance(v, dict) and "v" in v:
            components[k] = v["v"]

    return {
        "lat": lat,
        "lon": lon,
        "aqi": data.get("aqi"),
        "dominantpol": data.get("dominentpol"),
        "components": components,
        "forecast": data.get("forecast", {}),
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.post("/generate_report")
def generate_report(req: ReportRequest):
    # Fetch AQI
    url = f"https://api.waqi.info/feed/geo:{req.lat};{req.lon}/?token={AQI_TOKEN}"
    res = requests.get(url).json()
    if res.get("status") != "ok":
        raise HTTPException(status_code=404, detail="AQI data not found")

    aqi = res["data"].get("aqi")
    user_info = {"name": req.name, "lat": req.lat, "lon": req.lon}

    # Generate AI report
    prompt = f"User info: {user_info}, AQI: {aqi}. Generate a detailed health impact report."
    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "You are a medical advisor specializing in environmental health."},
            {"role": "user", "content": prompt}
        ]
    )
    report_text = response.choices[0].message["content"]
    return {"aqi": aqi, "report": report_text}
