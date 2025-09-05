from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os, json, requests
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, firestore

# ---------------------------
# Initialize FastAPI app
# ---------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],  # allow local + deployed frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Firebase setup
# ---------------------------
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

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------------------------
# API Keys
# ---------------------------
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

# ---------------------------
# Models
# ---------------------------
class ReportResponse(BaseModel):
    report: str

# ---------------------------
# Generate Report
# ---------------------------
@app.get("/generate_report", response_model=ReportResponse)
def generate_report(user_id: str = Query(...)):
    try:
        # 🔹 Fetch profile
        profile_ref = db.collection("users").document(user_id)
        profile_doc = profile_ref.get()
        if not profile_doc.exists:
            return JSONResponse(status_code=404, content={"error": "User profile not found."})
        profile = profile_doc.to_dict()

        # 🔹 Fetch latest pollution (global, or per-user if you store user_id)
        pollution_query = (
            db.collection("pollution")
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(1)
        )
        pollution_docs = pollution_query.stream()

        pollution = None
        for doc in pollution_docs:
            pollution = doc.to_dict()
            break

        if not pollution:
            return JSONResponse(status_code=404, content={"error": "No pollution data found."})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Firestore fetch failed: {str(e)}"})

    # ---------------------------
    # Build AI Prompt
    # ---------------------------
    prompt = f"""
    Generate a health impact report in a structured prescription letter format:

    1. **Header**
       - Location: {pollution.get('city')}
       - Name: {profile.get('name')}
       - Age: {profile.get('age')}
       - Gender: {profile.get('gender')}
       - Health Condition: {profile.get('disease', 'None')}

    2. **Summary of Air Conditions**
       - PM2.5: {pollution.get('pm2_5')}
       - PM10: {pollution.get('pm10')}
       - CO: {pollution.get('co')}
       - NO₂: {pollution.get('no2')}
       - O₃: {pollution.get('o3')}

    3. Short-Term Effects
    4. Long-Term Effects
    5. Safety Timeline
    6. Precautionary Measures
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
            json=payload,
            # timeout=30
        )
        response.raise_for_status()
        data = response.json()

        choices = data.get("choices", [])
        if not choices:
            return JSONResponse(status_code=500, content={"error": "No choices returned from AI."})

        message = choices[0].get("message") or choices[0].get("delta", {})
        report_text = message.get("content", "")

        if not report_text:
            return JSONResponse(status_code=500, content={"error": "AI returned empty report."})

        return {"report": report_text}

    except requests.exceptions.RequestException as e:
        return JSONResponse(status_code=500, content={"error": f"Request to AI failed: {str(e)}"})
