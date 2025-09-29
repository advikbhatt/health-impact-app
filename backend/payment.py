from fastapi import APIRouter, Query
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import os, hashlib
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# ---------------------------
# Firebase init
# ---------------------------
if not firebase_admin._apps:
    cred = credentials.Certificate(os.getenv("FIREBASE_CRED_JSON"))  # path to your JSON key
    firebase_admin.initialize_app(cred)
db = firestore.client()

router = APIRouter()
load_dotenv()

# AirPay credentials from environment
AIRPAY_MERCHANT_ID = os.getenv("AIRPAY_MERCHANT_ID")
AIRPAY_USERNAME = os.getenv("AIRPAY_USERNAME")
AIRPAY_PASSWORD = os.getenv("AIRPAY_PASSWORD")
AIRPAY_SECRET_KEY = os.getenv("AIRPAY_SECRET_KEY")
AIRPAY_BASE_URL = "https://payments.airpay.co.in"  # live URL
AIRPAY_RETURN_URL = os.getenv("AIRPAY_RETURN_URL")  # your production return URL

# ----- Payment Request Model -----
class PaymentRequest(BaseModel):
    user_id: str
    amount: float

# ----- Start Payment -----
@router.post("/start_payment")
def start_payment(req: PaymentRequest):
    try:
        # Fetch user profile from Firebase
        doc_ref = db.collection("users").document(req.user_id)
        user_doc = doc_ref.get()
        if not user_doc.exists:
            return JSONResponse(status_code=404, content={"error": "User not found in Firebase."})

        user_data = user_doc.to_dict()

        # Generate checksum (AirPay)
        checksum_str = f"{AIRPAY_USERNAME}:{AIRPAY_PASSWORD}:{AIRPAY_SECRET_KEY}"
        checksum = hashlib.sha256(checksum_str.encode()).hexdigest()

        # Build AirPay payload using Firebase data
        payload = {
            "mercid": AIRPAY_MERCHANT_ID,
            "buyerEmail": user_data.get("email", f"{req.user_id}@example.com"),
            "buyerPhone": user_data.get("phone", "9999999999"),
            "buyerFirstName": user_data.get("name", "User").split(" ")[0],
            "buyerLastName": user_data.get("name", "User").split(" ")[-1],
            "amount": str(req.amount),
            "orderid": req.user_id,
            "checksum": checksum,
            "currency": "INR",
            "returnUrl": AIRPAY_RETURN_URL,
        }

        # Build query string
        query_string = "&".join([f"{k}={v}" for k, v in payload.items()])
        redirect_url = f"{AIRPAY_BASE_URL}/payments?{query_string}"

        return {"redirect_url": redirect_url}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
