from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, json
from dotenv import load_dotenv
import requests
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi import APIRouter
import razorpay
from fastapi import Request
import hmac, hashlib
from fastapi.responses import JSONResponse
import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import Query


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
    os.makedirs("temp_storage", exist_ok=True)
    with open("temp_storage/profile.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "User saved"}

@app.post("/save_pollution")
def save_pollution(data: PollutionData):
    db.collection("pollution").add(data.dict())
    os.makedirs("temp_storage", exist_ok=True)
    with open("temp_storage/pollution.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "Pollution saved"}

class ReportResponse(BaseModel):
    report: str

@app.get("/generate_report", response_model=ReportResponse)
def generate_report():

    try:
        with open("temp_storage/profile.json") as f1, open("temp_storage/pollution.json") as f2:
            profile = json.load(f1)
            pollution = json.load(f2)
    except FileNotFoundError:
        return {"error": "Missing profile or pollution data"}


    prompt = f"""
    Generate a health impact report in a structured prescription letter format. Follow this exact layout:

    1. **Header (top)**
       - Location: {pollution['city']}
       - Name: {profile['name']}
       - Age: {profile['age']}
       - Gender: {profile['gender']}
       - Health Condition: {profile['disease'] if profile['disease'] != 'none' else 'None'}

    2. **Summary of Local Air Conditions (3 lines)**
       - Summarize the pollution in the area using PM2.5: {pollution['pm2_5']}, PM10: {pollution['pm10']}, CO: {pollution['co']}, NO₂: {pollution['no2']}, O₃: {pollution['o3']}.
       - Mention if levels are safe, moderate, or unsafe.
       - Comment briefly on the air quality's typical effect in this region.

    3. **Short-Term Effects (3 points)**
       - Bullet points describing likely immediate health effects for a person with this profile in this area.

    4. **Long-Term Effects (3 points)**
       - Bullet points on possible chronic health issues over time.

    5. **Safety Timeline**
       - 3 Years: [risk level and expected symptoms]
       - 5 Years: [risk level and expected symptoms]
       - 7 Years: [risk level and expected symptoms]
       - 10+ Years: [risk level and expected symptoms]

    6. **Precautionary Measures (3 points)**
       - Bullet points with actionable health and environmental safety tips.

    Always keep the language clear, medically sound but simple, and maintain the formatting exactly as above.
    """
    

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

from fastapi import FastAPI
from pydantic import BaseModel
import os, json
from firebase_admin import firestore

app = FastAPI()
db = firestore.client()

# --- Paid User Profile Schema ---
class PaidUserProfile(BaseModel):
    name: str
    age: int
    gender: str
    city: str
    disease: str
    lifestyle: str
    medical_history: str
    smoking: str      
    exercise: str
    diet: str
    stress_level: str

@app.post("/save_paid_user")
def save_paid_user(data: PaidUserProfile):
    db.collection("paid_users").add(data.dict())
    os.makedirs("temp_storage", exist_ok=True)
    with open("temp_storage/paid_profile.json", "w") as f:
        json.dump(data.dict(), f)
    return {"msg": "✅ Paid user data saved successfully"}


@app.get("/generate_paid_report", response_model=ReportResponse)
def generate_paid_report():
    try:
        with open("temp_storage/paid_profile.json") as f1, open("temp_storage/pollution.json") as f2:
            profile = json.load(f1)
            pollution = json.load(f2)
    except FileNotFoundError:
        return {"error": "Missing paid profile or pollution data"}

    # Richer prompt for paid users
    prompt = f"""
    Generate a **premium health report** in a structured medical prescription format with clear headings.

    1. **Patient Details**
       - Name: {profile['name']}
       - Age: {profile['age']}
       - Gender: {profile['gender']}
       - City: {profile['city']}
       - Existing Condition: {profile['disease'] if profile['disease'] != 'none' else 'None'}

    2. **Lifestyle & Medical Background**
       - Lifestyle: {profile['lifestyle']}
       - Medical History: {profile['medical_history']}
       - Smoking: {"Yes" if profile['smoking'] else "No"}
       - Exercise: {profile['exercise']}
       - Diet: {profile['diet']}
       - Stress Level: {profile['stress_level']}

    3. **Air Pollution Analysis**
       - PM2.5: {pollution['pm2_5']}
       - PM10: {pollution['pm10']}
       - CO: {pollution['co']}
       - NO₂: {pollution['no2']}
       - O₃: {pollution['o3']}
       - Explain whether levels are safe, moderate, or unsafe.

    4. **Personalized Health Risks**
       - Short-term effects (tailored to this patient).
       - Long-term effects (chronic risks considering lifestyle & history).

    5. **Graphical Insights**
       - Suggest how graphs can show pollution impact on health (e.g., lung function decline over years).

    6. **Prescription & Recommendations**
       - Medication-style advice (if applicable).
       - Lifestyle changes (customized).
       - Preventive measures.

    7. **Prognosis Timeline**
       - 3 Years: ...
       - 5 Years: ...
       - 7 Years: ...
       - 10+ Years: ...
    """

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



