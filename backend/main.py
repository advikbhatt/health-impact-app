from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, json
from dotenv import load_dotenv
import requests
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi.middleware.cors import CORSMiddleware
# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load environment variables
load_dotenv()
cred = credentials.Certificate({
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL")
})
firebase_admin.initialize_app(cred)
# Initialize Firebase only once
# if not firebase_admin._apps:
#     cred = credentials.Certificate("firebase_config.json")
#     firebase_admin.initialize_app(cred)

db = firestore.client()

# Load API keys
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

if not OPENWEATHER_API_KEY or not PERPLEXITY_API_KEY:
    raise EnvironmentError("Missing OPENWEATHER_API_KEY or PERPLEXITY_API_KEY in environment variables.")



# CORS Middleware for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific origin in production
    allow_methods=["*"],
    allow_headers=["*"]
)

# Pydantic models for data validation
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

# Save user data to Firebase and local file
@app.post("/save_user")
def save_user(data: UserProfile):
    db.collection("users").add(data.dict())
    os.makedirs("temp_storage", exist_ok=True)
    with open("temp_storage/profile.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "User saved"}

# Save pollution data to Firebase and local file
@app.post("/save_pollution")
def save_pollution(data: PollutionData):
    db.collection("pollution").add(data.dict())
    os.makedirs("temp_storage", exist_ok=True)
    with open("temp_storage/pollution.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "Pollution saved"}


@app.get("/generate_report")
def generate_report():
    try:
        with open("temp_storage/profile.json") as f1, open("temp_storage/pollution.json") as f2:
            profile = json.load(f1)
            pollution = json.load(f2)
    except FileNotFoundError:
        return {"error": "Missing profile or pollution data"}

    prompt = (
        f"You are a health expert. Generate a detailed but simple health impact report for a {profile['age']} year old "
        f"{profile['gender']} from {pollution['city']} with {profile['disease']}. "
        f"Pollution levels: PM2.5={pollution['pm2_5']}, PM10={pollution['pm10']}, CO={pollution['co']}, "
        f"NO₂={pollution['no2']}, O₃={pollution['o3']}. "
        f"Explain short-term and long-term health effects, and suggest precautions."
    )

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "sonar-reasoning",
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        data = response.json()

        report_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not report_text:
            return {"error": "AI did not return any content."}

        return {"report": report_text}

    except requests.exceptions.RequestException as e:
        return {"error": f"Request to AI failed: {e}"}