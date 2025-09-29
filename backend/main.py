from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse
from pydantic import BaseModel
import os, hashlib, uuid, json, base64, requests
from dotenv import load_dotenv
from datetime import datetime

import firebase_admin
from firebase_admin import firestore
from Crypto.Cipher import AES

# ---------------------------
# Load env variables
# ---------------------------
load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

AIRPAY_MERCHANT_ID = os.getenv("AIRPAY_MERCHANT_ID")
AIRPAY_USERNAME = os.getenv("AIRPAY_USERNAME")
AIRPAY_PASSWORD = os.getenv("AIRPAY_PASSWORD")
AIRPAY_SECRET_KEY = os.getenv("AIRPAY_SECRET_KEY")
AIRPAY_SECRETKEY_V4 = os.getenv("AIRPAY_SECRETKEY_V4")  # AES encryption key
AIRPAY_CLIENT_ID = os.getenv("AIRPAY_CLIENT_ID")
AIRPAY_RETURN_URL = "https://healthimpact.onrender.com/payment/callback"
AIRPAY_BASE_URL = "https://payments.airpay.co.in/pay/v4"

# ---------------------------
# Firebase init
# ---------------------------
if not firebase_admin._apps:
    firebase_admin.initialize_app()
db = firestore.client()

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

class PaymentRequest(BaseModel):
    user_id: str
    amount: float

# ---------------------------
# Utility: AES Encrypt for Airpay
# ---------------------------
def encrypt(data: str, secret_key: str) -> str:
    key = hashlib.sha256(secret_key.encode()).digest()
    cipher = AES.new(key, AES.MODE_ECB)
    pad = 16 - len(data) % 16
    data += chr(pad) * pad
    encrypted = cipher.encrypt(data.encode())
    return base64.b64encode(encrypted).decode()

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
# Generate Health Report
# ---------------------------
@app.get("/generate_report", response_model=ReportResponse)
def generate_report(user_id: str = Query(...)):
    try:
        # Fetch user profile
        profile_ref = db.collection("users").document(user_id)
        profile_doc = profile_ref.get()

        # Auto-create user if not exists
        if not profile_doc.exists:
            profile_ref.set({
                "name": f"User-{user_id[:5]}",
                "hasPaid": False,
                "createdAt": datetime.utcnow(),
                "age": None,
                "gender": None,
                "disease": None
            })
            profile_doc = profile_ref.get()

        profile = profile_doc.to_dict()

        # Check payment status
        if not profile.get("hasPaid", False):
            return JSONResponse(
                status_code=402,
                content={"error": "Payment required"}
            )

        # Fetch latest pollution
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

    # Build AI Prompt
    prompt = f"""
    Generate a health impact report in a structured prescription letter format:

    1. Header
       - Location: {pollution.get('city')}
       - Name: {profile.get('name')}
       - Age: {profile.get('age')}
       - Gender: {profile.get('gender')}
       - Health Condition: {profile.get('disease', 'None')}

    2. Summary of Air Conditions
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

    payload = {"model": "sonar-reasoning", "messages": [{"role": "user", "content": prompt}]}

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

# ---------------------------
# Start Payment (Airpay)
# ---------------------------
@app.post("/start_payment")
def start_payment(req: PaymentRequest):
    try:
        user_ref = db.collection("users").document(req.user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return JSONResponse(status_code=404, content={"error": "User not found"})
        user = user_doc.to_dict()

        # Minimal required payload
        payload = {
            "orderid": str(uuid.uuid4()),
            "amount": f"{req.amount:.2f}",
            "currency_code": "356",
            "iso_currency": "INR",
            "buyer_email": user.get("email"),
            "buyer_phone": user.get("phone"),
            "buyer_firstname": user.get("name", "User"),
            "buyer_lastname": user.get("name", "User")
        }

        privatekey = hashlib.sha256(f"{AIRPAY_SECRET_KEY}@{AIRPAY_USERNAME}:|:{AIRPAY_PASSWORD}".encode()).hexdigest()
        encdata = encrypt(json.dumps(payload), AIRPAY_SECRETKEY_V4)
        checksum = hashlib.sha256(json.dumps(payload).encode()).hexdigest()

        html_form = f"""
        <html><body onload="document.forms[0].submit()">
        <form method="post" action="{AIRPAY_BASE_URL}/?token={AIRPAY_CLIENT_ID}">
            <input type="hidden" name="privatekey" value="{privatekey}" />
            <input type="hidden" name="merchant_id" value="{AIRPAY_MERCHANT_ID}" />
            <input type="hidden" name="encdata" value="{encdata}" />
            <input type="hidden" name="checksum" value="{checksum}" />
        </form>
        </body></html>
        """
        return HTMLResponse(content=html_form)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ---------------------------
# Payment Callback
# ---------------------------
@app.post("/payment/callback")
async def payment_callback(request: Request):
    try:
        form_data = await request.form()
        orderid = form_data.get("orderid")
        status = form_data.get("transaction_payment_status")

        # Update Firestore
        db.collection("payments").document(orderid).set({
            "orderid": orderid,
            "status": status,
            "data": dict(form_data)
        })

        # Mark user as paid if successful
        if status == "SUCCESS":
            user_id = form_data.get("orderid")  # assuming orderid = user_id here
            db.collection("users").document(user_id).update({"hasPaid": True})

        return RedirectResponse(f"https://healthimpact.onrender.com/report?orderid={orderid}&status={status}")

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
