from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import os, requests
from dotenv import load_dotenv
from db import db

load_dotenv()

AIRPAY_MERCHANT_ID = os.getenv("AIRPAY_MERCHANT_ID")
AIRPAY_USERNAME = os.getenv("AIRPAY_USERNAME")
AIRPAY_PASSWORD = os.getenv("AIRPAY_PASSWORD")
AIRPAY_API_KEY = os.getenv("AIRPAY_API_KEY")

router = APIRouter()

@router.post("/start_payment")
async def start_payment(data: dict):
    """
    Initiates payment with Airpay
    data = { "user_id": "...", "amount": 1.0 }
    """
    try:
        user_id = data.get("user_id")
        amount = data.get("amount", 1.0)
        if not user_id:
            return JSONResponse(status_code=400, content={"error": "user_id is required"})

        # Example Airpay API request payload
        payload = {
            "merchant_id": AIRPAY_MERCHANT_ID,
            "username": AIRPAY_USERNAME,
            "password": AIRPAY_PASSWORD,
            "amount": amount,
            "currency": "INR",
            "callback_url": f"https://health-impact-app.onrender.com/payment_callback?user_id={user_id}"
        }

        # Make request to Airpay API (replace with real Airpay endpoint)
        res = requests.post("https://sandbox.airpay.co.in/initiate_payment", json=payload)
        res.raise_for_status()
        data = res.json()

        return {"redirect_url": data.get("redirect_url")}
    except Exception as e:
        print("❌ start_payment error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/payment_callback")
async def payment_callback(request: Request):
    """
    Airpay calls this endpoint after successful payment.
    Update Firestore `hasPaid` to True.
    """
    try:
        body = await request.json()
        user_id = request.query_params.get("user_id")
        if not user_id:
            return JSONResponse(status_code=400, content={"error": "user_id missing"})

        # TODO: validate payment using Airpay response (checksum/signature)
        # For now, assume success
        user_ref = db.collection("users").document(user_id)
        user_ref.update({"hasPaid": True})

        return JSONResponse({"success": True, "message": "Payment recorded."})
    except Exception as e:
        print("❌ payment_callback error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})
