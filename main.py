from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json

import requests
import firebase_admin
from firebase_admin import credentials, db

# Load environment variables from .env
load_dotenv()

# Firebase config from environment variables
firebase_creds = {
    "type": os.getenv("FIREBASE_TYPE", "service_account"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL"),
}

# Initialize Firebase app only once
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_creds)
    firebase_admin.initialize_app(cred, {
        "databaseURL": os.getenv("FIREBASE_DB_URL")
    })

app = FastAPI()

# Allow CORS (adjust allowed origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ENV-based API keys
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
AIR_API_KEY = os.getenv("AIR_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

# Save user profile
@app.post("/user_profile")
async def save_user_profile(data: dict):
    try:
        ref = db.reference("/users")
        ref.push(data)
        return {"message": "User profile saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Save pollution info
@app.post("/pollution_info")
async def save_pollution_info(data: dict):
    try:
        ref = db.reference("/pollution")
        ref.push(data)
        return {"message": "Pollution data saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Generate AI health report
@app.post("/generate_report")
async def generate_report(data: dict):
    try:
        prompt = f"""Generate a health impact report for a {data['age']} year old {data['gender']} in {data['city']} based on these pollution values:
        PM2.5: {data['pm2_5']} µg/m³, PM10: {data['pm10']} µg/m³, CO: {data['co']} µg/m³, NO2: {data['no2']} µg/m³, O3: {data['o3']} µg/m³.
        Include short-term effects, long-term effects, and precautions."""
        
        response = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers={
                "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3-sonar-small-32k-online",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7
            }
        )

        response.raise_for_status()
        result = response.json()
        report = result['choices'][0]['message']['content']

        return {"report": report}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")
