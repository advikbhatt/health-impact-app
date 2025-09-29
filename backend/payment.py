# payment.py
from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import os, hashlib
from dotenv import load_dotenv

router = APIRouter()
load_dotenv()

# AirPay credentials from environment
AIRPAY_MERCHANT_ID = os.getenv("AIRPAY_MERCHANT_ID")
AIRPAY_USERNAME = os.getenv("AIRPAY_USERNAME")
AIRPAY_PASSWORD = os.getenv("AIRPAY_PASSWORD")
AIRPAY_SECRET_KEY = os.getenv("AIRPAY_SECRET_KEY")

AIRPAY_BASE_URL = "https://payments.airpay.co.in"  # live URL

# ----- Payment Request Model -----
class PaymentRequest(BaseModel):
    user_id: str
    amount: float

# ----- Start Payment (AirPay) -----
@router.post("/start_payment")
def start_payment(req: PaymentRequest):
    try:
        # Generate checksum (required by AirPay)
        checksum_str = f"{AIRPAY_USERNAME}:{AIRPAY_PASSWORD}:{AIRPAY_SECRET_KEY}"
        checksum = hashlib.sha256(checksum_str.encode()).hexdigest()

        # Payload required by AirPay
        payload = {
            "mercid": AIRPAY_MERCHANT_ID,
            "buyerEmail": f"{req.user_id}@test.com",    # can be actual email
            "buyerPhone": "9999999999",                 # placeholder
            "buyerFirstName": "Test",
            "buyerLastName": "User",
            "amount": str(req.amount),
            "orderid": req.user_id,
            "checksum": checksum,
            "currency": "INR",
            "returnUrl": "http://localhost:5173/report",  # after payment
        }

        # Build query string
        query_string = "&".join([f"{k}={v}" for k, v in payload.items()])
        redirect_url = f"{AIRPAY_BASE_URL}/payments?{query_string}"

        return {"redirect_url": redirect_url}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
