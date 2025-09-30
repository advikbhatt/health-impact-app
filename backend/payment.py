from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse
import hashlib, os
from dotenv import load_dotenv
from db import db  

router = APIRouter()

# ---------------------------
# Load environment variables
# ---------------------------
load_dotenv()
MERCHANT_ID = os.getenv("AIRPAY_MERCHANT_ID")
USERNAME = os.getenv("AIRPAY_USERNAME")
PASSWORD = os.getenv("AIRPAY_PASSWORD")
API_KEY = os.getenv("AIRPAY_API_KEY")

PAYMENT_URL = "https://payments.airpay.co.in/pay"  # change if sandbox differs


# ---------------------------
# Helpers
# ---------------------------
def generate_signature(params: dict) -> str:
    """
    Generate signature as per Airpay docs.
    Concatenate values in sorted key order + API_KEY, then SHA256.
    """
    raw_str = "|".join([str(params[k]) for k in sorted(params.keys())]) + "|" + API_KEY
    return hashlib.sha256(raw_str.encode()).hexdigest()


# ---------------------------
# Start Payment
# ---------------------------
@router.post("/start_payment")
async def start_payment(request: Request):
    """
    Called from frontend when user clicks 'Pay Now'.
    Returns redirect_url to Airpay checkout.
    """
    body = await request.json()
    user_id = body.get("user_id")
    amount = body.get("amount", 1.0)

    if not user_id:
        return JSONResponse(status_code=400, content={"error": "Missing user_id"})

    params = {
        "mercid": MERCHANT_ID,
        "username": USERNAME,
        "password": PASSWORD,
        "orderid": user_id,   
        "currency": "356",    
        "amount": str(amount),
        "returnurl": "https://health-impact-app.onrender.com/payment_callback",
    }
    params["signature"] = generate_signature(params)

    redirect_url = f"{PAYMENT_URL}?{'&'.join([f'{k}={v}' for k,v in params.items()])}"
    return {"redirect_url": redirect_url}


# ---------------------------
# Payment Callback
# ---------------------------
@router.post("/payment_callback")
async def payment_callback(request: Request):
    """
    Airpay calls this after payment completion.
    Updates Firestore user document with hasPaid=True if success.
    """
    form = await request.form()
    status = form.get("TRANSACTIONSTATUS")
    user_id = form.get("ORDERID")

    if not user_id:
        return JSONResponse(status_code=400, content={"error": "Missing ORDERID"})

    if status and status.upper() == "SUCCESS":
        user_ref = db.collection("users").document(user_id)
        user_ref.update({"hasPaid": True})
        return RedirectResponse(url="http://localhost:5173/report")  
    else:
        return JSONResponse(status_code=400, content={"error": "Payment failed"})
