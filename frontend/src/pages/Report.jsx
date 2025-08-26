import React, { useState } from "react";
import axios from "axios";
import "./Report.css";

const Report = ({ user }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  const loadRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = startPayment;
    script.onerror = () => alert("Failed to load Razorpay SDK.");
    document.body.appendChild(script);
  };

  const startPayment = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/create_order`, {
        amount: 5 * 100, // ₹5 in paise
        currency: "INR",
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: res.data.amount,
        currency: res.data.currency,
        order_id: res.data.id,
        name: "AI Health Report",
        description: "Pay ₹5 to unlock report",
        handler: async (response) => {
          const verify = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/verify_payment`, response);
          if (verify.data.status === "success") {
            setPaid(true);
            fetchReport();
          } else {
            setError("❌ Payment verification failed.");
          }
        },
        prefill: {
          name: user.name,
          email: "user@example.com", // Optional
          contact: "9999999999",     // Optional
        },
        theme: { color: "#f08a24" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setError("❌ Payment initiation failed.");
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/generate_report`);
      setReport(res.data?.report || "⚠️ No content returned from AI.");
    } catch {
      setError("⚠️ Failed to fetch health report.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="report-placeholder">Please submit user data to see report.</p>;
  if (error) return <p className="report-error">{error}</p>;

  return (
    <div className="report-container">
      <h2 className="report-title">Health Impact Report</h2>
      {!paid ? (
        <div className="payment-box">
          <p className="payment-instruction">Pay ₹5 to unlock your personalized AI health report.</p>
          <button onClick={loadRazorpay} className="pay-btn">Pay ₹5</button>
        </div>
      ) : loading ? (
        <p className="report-status">Generating your report. Please wait...</p>
      ) : (
        <div className="report-content">{report}</div>
      )}
    </div>
  );
};

export default Report;
