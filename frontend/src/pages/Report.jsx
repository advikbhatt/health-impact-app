import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";
import "./Report.css";

const Report = ({ user }) => {
  const [report, setReport] = useState("# Health Report\n\nPayment Gateway needed...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reportRef = useRef(null);

  const fetchReport = async () => {
    if (!user?.uid) {
      setError("⚠️ User not logged in or UID missing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📡 Calling backend for report, UID:", user.uid);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/generate_report`,
        { params: { user_id: user.uid } }
      );

      console.log("✅ Backend response:", res.data);

      if (!res.data?.report) {
        throw new Error("No report returned from backend");
      }

      setReport(res.data.report);
    } catch (err) {
      console.error("❌ fetchReport error:", err);
      setError("⚠️ Failed to generate health report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: `Health_Report_${user?.name || "user"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    if (user?.uid) {
      fetchReport();
    }
  }, [user]);

  if (!user) {
    return <p className="report-placeholder">Please log in to view your report.</p>;
  }
  if (error) {
    return <p className="report-error">{error}</p>;
  }

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
            <button onClick={downloadPDF} disabled={loading} className="btn-download">
              📄 Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Report;
