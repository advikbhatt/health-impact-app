import React, { useEffect, useState } from "react";

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  // 👇 Get logged-in userId (adjust if you use context/provider)
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("You must be logged in to view your report.");
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch(
          `https://health-impact-app.onrender.com/generate_report?user_id=${userId}`
        );

        if (res.status === 402) {
          const payRes = await fetch(
            "https://health-impact-app.onrender.com/start_payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userId, amount: 1.0 }),
            }
          );

          const payData = await payRes.json();
          if (payData.redirect_url) {
            window.location.href = payData.redirect_url; 
          } else {
            setError("Payment initiation failed.");
          }
          return;
        }

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Error generating report");
          return;
        }

        const data = await res.json();
        setReport(data.report);
      } catch (err) {
        setError("Unexpected error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [userId]);

  if (loading) return <p className="p-4 text-gray-600">Loading report...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Your Health Impact Report</h1>
      <pre className="whitespace-pre-wrap text-gray-800">{report}</pre>
    </div>
  );
};

export default Report;
