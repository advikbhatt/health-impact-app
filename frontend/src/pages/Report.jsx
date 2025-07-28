// src/components/Report.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Report = ({ user }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/generate_report");
      const content = res?.data?.choices?.[0]?.message?.content;
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

  if (!user) return <p className="text-center text-gray-400 mt-6">Please submit user data to see report.</p>;
  if (error) return <p className="text-red-500 mt-5 text-center">{error}</p>;
  if (loading) return <p className="text-center mt-6 text-cyan-300">Generating report...</p>;

  return (
    <div className="mt-10 max-w-3xl mx-auto bg-[#0f172a] text-white rounded-xl shadow-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-purple-400 mb-4">🧠 Health Impact Report</h2>
      <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed text-gray-100 whitespace-pre-wrap font-mono border border-gray-700">
        {report}
      </div>
    </div>
  );
};

export default Report;
