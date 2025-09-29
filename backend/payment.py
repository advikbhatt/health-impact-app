# payment.py
from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import os, hashlib
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import firestore

# Initialize Firebase
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()
router = APIRouter()
load_dotenv()

# AirPay credentials from environment
AIRPAY_MERCHANT_ID = os.getenv("AIRPAY_MERCHANT_ID")
AIRPAY_USERNAME = os.getenv("AIRPAY_USERNAME")
AIRPAY_PASSWORD = os.getenv("AIRPAY_PASSWORD")
AIRPAY_SECRET_KEY = os.getenv("AIRPAY_SECRET_KEY")
AIRPAY_RETURN_URL = os.getenv("AIRPAY_RETURN_URL")  

AIRPAY_BASE_URL = "https://payments.airpay.co.in"  

# ----- Payment Request Model -----
class PaymentRequest(BaseModel):
    user_id: str
    amount: float

# ----- Start Payment (AirPay) -----
@router.post("/start_payment")
def start_payment(req: PaymentRequest):
    try:
        # Fetch user from Firestore
        user_ref = db.collection("users").document(req.user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return JSONResponse(status_code=404, content={"error": "User profile not found."})

        user_data = user_doc.to_dict()

        # Use actual user data
        buyer_email = user_data.get("email") 
        buyer_phone = user_data.get("phone") 
        buyer_name = user_data.get("name") or f"User-{req.user_id[:5]}"

        # Generate checksum
        checksum_str = f"{AIRPAY_USERNAME}:{AIRPAY_PASSWORD}:{AIRPAY_SECRET_KEY}"
        checksum = hashlib.sha256(checksum_str.encode()).hexdigest()

        # Prepare AirPay payload
        payload = {
            "mercid": AIRPAY_MERCHANT_ID,
            "buyerEmail": buyer_email,
            "buyerPhone": buyer_phone,
            "buyerFirstName": buyer_name,
            "buyerLastName": buyer_name,
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
