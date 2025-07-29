from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, json
from dotenv import load_dotenv
import requests
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables from .env
load_dotenv()

# Secure Firebase credential initialization
cred_path = os.getenv("FIREBASE_CRED_PATH", "firebase_config.json")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# API Keys securely loaded from env
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_methods=["*"],
    allow_headers=["*"]
)

# Pydantic models
class UserProfile(BaseModel):
    name: str
    age: int
    gender: str
    city: str
    disease: str

class PollutionData(BaseModel):
    city: str
    lat: float
    lon: float
    pm2_5: float
    pm10: float
    co: float
    no2: float
    o3: float

# Endpoint to save user profile
@app.post("/save_user")
def save_user(data: UserProfile):
    db.collection("users").add(data.dict())
    os.makedirs("temp_storage", exist_ok=True)
    with open("temp_storage/profile.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "User saved"}

# Endpoint to save pollution data
@app.post("/save_pollution")
def save_pollution(data: PollutionData):
    db.collection("pollution").add(data.dict())
    os.makedirs("temp_storage", exist_ok=True)
    with open("temp_storage/pollution.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "Pollution data saved"}

# Endpoint to generate AI health report
@app.get("/generate_report")
def generate_report():
    try:
        with open("temp_storage/profile.json") as f1, open("temp_storage/pollution.json") as f2:
            profile = json.load(f1)
            pollution = json.load(f2)
    except FileNotFoundError:
        return {"error": "User or pollution data missing"}

    prompt = (
        f"You are a health expert. Generate a health impact report for a {profile['age']} year old "
        f"{profile['gender']} from {pollution['city']} with {profile['disease']}. "
        f"Pollution levels: PM2.5={pollution['pm2_5']}, PM10={pollution['pm10']}, CO={pollution['co']}, "
        f"NO2={pollution['no2']}, O3={pollution['o3']}. Provide short-term and long-term health effects, and precautions."
    )

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "sonar-reasoning",
        "messages": [{"role": "user", "content": prompt}]
    }

    response = requests.post("https://api.perplexity.ai/chat/completions", headers=headers, json=payload)

    if response.status_code != 200:
        return {"error": "Failed to fetch report from Perplexity", "details": response.text}

    return response.json()
