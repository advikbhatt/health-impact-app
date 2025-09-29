// Report.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";
import "./Report.css";

const Report = () => {
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(
    "# Health Report\n\n⚠️ Please pay to access your health report."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const reportRef = useRef(null);

  // ----- Generate or load UID for each user -----
  useEffect(() => {
    let uid = localStorage.getItem("user_uid");
    if (!uid) {
      uid = crypto.randomUUID(); // modern browsers
      localStorage.setItem("user_uid", uid);
    }
    setUser({
      uid,
      name: "User-" + uid.slice(0, 5),
    });
  }, []);

  // ----- Fetch Report -----
  const fetchReport = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/generate_report`,
        { params: { user_id: user.uid } }
      );

      if (res.data?.report) {
        setHasPaid(true);
        setReport(res.data.report);
      }
    } catch (err) {
      if (err.response?.status === 402) {
        setHasPaid(false);
        setReport(
          "# Health Report\n\n💳 Payment required before generating your health report."
        );
      } else {
        console.error("❌ fetchReport error:", err);
        setError("⚠️ Failed to generate health report.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startPayment = async () => {
    if (!user?.uid) return alert("User UID missing");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/start_payment`,
        {
          user_id: user.uid,
          amount: 85.0,
        }
      );

      if (res.data?.redirect_url) {
        window.location.href = res.data.redirect_url;
      } else {
        alert("❌ Could not start payment.");
      }
    } catch (err) {
      console.error("❌ startPayment error:", err);
      alert("⚠️ Payment failed to start.");
    }
  };

  const downloadPDF = () => {
    const element = reportRef.current;
    html2pdf()
      .set({
        margin: 0.5,
        filename: `Health_Report_${user?.name || "user"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  useEffect(() => {
    if (user?.uid) fetchReport();
  }, [user]);

  if (!user) return <p className="report-placeholder">Loading user info...</p>;
  if (error) return <p className="report-error">{error}</p>;

  return (
    <div className="report-container">
      <h2 className="report-title">HEALTH IMPACT REPORT</h2>
      {loading ? (
        <p className="report-status">⏳ Generating your report. Please wait...</p>
      ) : (
        <>
          <div className="report-content" ref={reportRef}>
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>

          <div className="report-actions">
            {hasPaid ? (
              <button onClick={downloadPDF} className="btn-download">
                📄 Download PDF
              </button>
            ) : (
              <button onClick={startPayment} className="btn-pay">
                💳 Pay Now
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Report;
