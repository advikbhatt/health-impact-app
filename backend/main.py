from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, json
from dotenv import load_dotenv
import requests
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()
cred = credentials.Certificate("firebase_config.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

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

@app.post("/save_user")
def save_user(data: UserProfile):
    db.collection("users").add(data.dict())
    with open("temp_storage/profile.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "User saved"}

@app.post("/save_pollution")
def save_pollution(data: PollutionData):
    db.collection("pollution").add(data.dict())
    with open("temp_storage/pollution.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "Pollution saved"}

@app.get("/generate_report")
def generate_report():
    with open("temp_storage/profile.json") as f1, open("temp_storage/pollution.json") as f2:
        profile = json.load(f1)
        pollution = json.load(f2)

    prompt = (
        f"You are a health expert from now on and you will give the following in the format like you are a professional and the other user is naive so explain him in simple terms."
        f"Generate a health impact report for a {profile['age']} year old "
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

    response = requests.post(
        "https://api.perplexity.ai/chat/completions",
        headers=headers,
        json=payload
    )

    return response.json()
