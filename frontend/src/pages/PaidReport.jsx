import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { saveAs } from "file-saver";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./PaidReport.css";

const PaidReport = ({ paidUser }) => {
  const [report, setReport] = useState("# Premium Health Report\n\nWaiting for data...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState([]);

  const cleanReport = (text) => {
    if (!text) return "";
    return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  };

  // --- Fetch Paid User Report ---
  const fetchPaidReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/generate_paid_report`);
      const cleaned = cleanReport(res.data?.report);
      setReport(cleaned || "⚠️ No content returned from AI.");

      // Example dummy chart data from AI backend
      if (res.data?.chart_data) {
        setChartData(res.data.chart_data);
      } else {
        // fallback demo data
        setChartData([
          { category: "Exercise", score: 70 },
          { category: "Diet", score: 60 },
          { category: "Stress", score: 80 },
          { category: "Smoking", score: 40 },
        ]);
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to fetch premium health report.");
    } finally {
      setLoading(false);
    }
  };

  // --- Download Paid Report ---
  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `Premium_Health_Report_${paidUser?.name || "user"}.txt`);
  };

  useEffect(() => {
    if (paidUser) fetchPaidReport();
  }, [paidUser]);

  if (!paidUser) return <p className="paid-report-placeholder">👉 Fill premium profile to unlock your customized report.</p>;
  if (error) return <p className="paid-report-error">{error}</p>;

  return (
    <div className="paid-report-container">
      <h2 className="paid-report-title">🌟 Premium Health Report</h2>

      {loading ? (
        <p className="paid-report-status">Generating your premium insights...</p>
      ) : (
        <>
          {/* Markdown Report */}
          <div className="paid-report-content">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>

          {/* Chart Section */}
          <div className="paid-report-chart">
            <h3>📊 Lifestyle Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Actions */}
          <div className="paid-report-actions">
            <button onClick={downloadReport} disabled={loading} className="btn-download">
              💾 Download Premium Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaidReport;
