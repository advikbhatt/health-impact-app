// src/components/Report.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Report.css";

const Report = ({ user }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/generate_report`);
      
      const content = res?.data?.report;
      setReport(content || "⚠️ No content returned from AI.");
    } catch {
      setError("⚠️ Failed to fetch health report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) getReport();
  }, [user]);

  if (!user) return <p className="report-placeholder">Please submit user data to see report.</p>;
  if (error) return <p className="report-error">{error}</p>;
  if (loading) return <p className="report-status">Hi...,While we review your specific location data for a personalized pollutant analysis, here’s an overview of your country's environmental data to keep you informed.</p>;

  return (
    <div className="report-container">
      <h2 className="report-title">Health Impact Report</h2>
      <div className="report-content">
        {report}
      </div>
    </div>
  );
};

export default Report;
