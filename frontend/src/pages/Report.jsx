import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Report = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setError("You must be logged in to view your report.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchReport = async () => {
      try {
        const res = await fetch(
          `https://health-impact-app.onrender.com/generate_report?user_id=${user.uid}`
        );

        if (res.status === 402) {
          const payRes = await fetch(
            "https://health-impact-app.onrender.com/start_payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: user.uid, amount: 1.0 }),
            }
          );

          const payData = await payRes.json();
          if (payData.redirect_url) window.location.href = payData.redirect_url;
          else setError("Payment initiation failed.");
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
  }, [user]);

  if (loading) return <p>Loading report...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Your Health Impact Report</h1>
      <pre>{report}</pre>
    </div>
  );
};

export default Report;
