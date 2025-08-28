import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { saveAs } from "file-saver";
import "./Report.css";

// --- Initialize Firebase ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Report = ({ user }) => {
  const [report, setReport] = useState("# Health Report\n\nWaiting for data...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cleanReport = (text) => {
    if (!text) return "";
    return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  };

  // --- Fetch report and automatically save to Firebase ---
  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/generate_report`);
      const cleaned = cleanReport(res.data?.report);
      setReport(cleaned || "⚠️ No content returned from AI.");

      // Auto-save to Firebase
      if (user?.id) {
        const reportName = `report_${new Date().toISOString()}`;
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
          reports: arrayUnion({ name: reportName, content: cleaned, createdAt: new Date().toISOString() }),
        });
        console.log("✅ Report automatically saved to Firebase!");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to fetch or save health report.");
    } finally {
      setLoading(false);
    }
  };

  // --- Download report ---
  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `Health_Report_${user?.name || "user"}.txt`);
  };

  useEffect(() => {
    if (user) fetchReport();
  }, [user]);

  if (!user) return <p className="report-placeholder">Please submit user data to see report.</p>;
  if (error) return <p className="report-error">{error}</p>;

  return (
    <div className="report-container">
      <h2 className="report-title">Health Impact Report</h2>
      {loading ? (
        <p className="report-status">Generating your report. Please wait...</p>
      ) : (
        <>
          <div className="report-content">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
          <div className="report-actions">
            <button onClick={downloadReport} disabled={loading} className="btn-download">
              💾 Download Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Report;
