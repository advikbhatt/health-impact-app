from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os, requests
from dotenv import load_dotenv
from datetime import datetime

from db import db
from payment import router as payment_router

# ---------------------------
# Initialize FastAPI app
# ---------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register payment routes
app.include_router(payment_router)

# ---------------------------
# API Keys
# ---------------------------
load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

# ---------------------------
# Models
# ---------------------------
class PollutionData(BaseModel):
    city: str
    pm2_5: float
    pm10: float
    co: float
    no2: float
    o3: float
    lat: float | None = None
    lon: float | None = None
    timestamp: str | None = None
    user_id: str | None = None

class ReportResponse(BaseModel):
    report: str


# ---------------------------
# Save Pollution Data
# ---------------------------
@app.post("/save_pollution")
def save_pollution(data: PollutionData):
    try:
        pollution_ref = db.collection("pollution").document()
        pollution_ref.set({
            "city": data.city,
            "pm2_5": data.pm2_5,
            "pm10": data.pm10,
            "co": data.co,
            "no2": data.no2,
            "o3": data.o3,
            "lat": data.lat,
            "lon": data.lon,
            "user_id": data.user_id,
            "timestamp": data.timestamp or datetime.utcnow().isoformat()
        })
        return {"success": True, "message": "Pollution data saved successfully."}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to save pollution data: {str(e)}"}
        )
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

        # 🔒 Check payment status
        if not profile.get("hasPaid", False):
            return JSONResponse(
                status_code=402,
                content={"error": "Payment required"}
            )

        # 🔹 Fetch latest pollution
        pollution_query = (
            db.collection("pollution")
            .order_by("timestamp", direction="DESCENDING")
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
