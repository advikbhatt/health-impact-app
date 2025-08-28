import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ReactMarkdown from "react-markdown";
import "./PremiumPage.css";

// --- Firebase config ---
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

const PremiumPage = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState(null);
  const [latestReport, setLatestReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) {
        setError("Please submit your user data first.");
        setLoading(false);
        return;
      }

      const userDocId = user.id || user.firebaseId || `${user.name}_${user.city}`;
      const userRef = doc(db, "users", userDocId);
      setLoading(true);
      setError("");

      try {
        const userRef = doc(db, "users", user.id);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          setError("No user data found in Firebase.");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const savedReports = data.reports || [];
        if (savedReports.length === 0) {
          setError("No saved reports found.");
          setLoading(false);
          return;
        }

        // Sort by creation date
        savedReports.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setLatestReport(savedReports[savedReports.length - 1].content);
        setReports(savedReports);

        // Extract pollution metrics
        const parsedHistory = savedReports.map((r) => {
          const lines = r.content.split("\n");
          let pm25 = null, pm10 = null, o3 = null;
          lines.forEach((line) => {
            if (line.toLowerCase().includes("pm2.5")) pm25 = parseFloat(line.match(/[\d.]+/));
            else if (line.toLowerCase().includes("pm10")) pm10 = parseFloat(line.match(/[\d.]+/));
            else if (line.toLowerCase().includes("o₃") || line.toLowerCase().includes("o3")) o3 = parseFloat(line.match(/[\d.]+/));
          });
          return { date: new Date(r.createdAt).toLocaleDateString(), pm25, pm10, o3 };
        });

        setHistoryData(parsedHistory);

        // Compute averages
        const validPm25 = parsedHistory.filter((d) => d.pm25 != null).map((d) => d.pm25);
        const validPm10 = parsedHistory.filter((d) => d.pm10 != null).map((d) => d.pm10);
        const validO3 = parsedHistory.filter((d) => d.o3 != null).map((d) => d.o3);

        setStats({
          avg_pm25: validPm25.length ? (validPm25.reduce((a, b) => a + b, 0) / validPm25.length).toFixed(2) : "N/A",
          avg_pm10: validPm10.length ? (validPm10.reduce((a, b) => a + b, 0) / validPm10.length).toFixed(2) : "N/A",
          avg_o3: validO3.length ? (validO3.reduce((a, b) => a + b, 0) / validO3.length).toFixed(2) : "N/A",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch reports from Firebase.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (loading) return <p className="report-status">Loading premium data...</p>;
  if (error) return <p className="report-error">{error}</p>;

  return (
    <div className="premium-container p-6">
      <h1 className="report-title mb-4">🌟 Premium Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-4 bg-gray-100 shadow rounded">
            <h3 className="font-bold">PM2.5 Avg</h3>
            <p>{stats.avg_pm25}</p>
          </div>
          <div className="card p-4 bg-gray-100 shadow rounded">
            <h3 className="font-bold">PM10 Avg</h3>
            <p>{stats.avg_pm10}</p>
          </div>
          <div className="card p-4 bg-gray-100 shadow rounded">
            <h3 className="font-bold">O₃ Avg</h3>
            <p>{stats.avg_o3}</p>
          </div>
        </div>
      )}

      {/* Line Chart */}
      {historyData.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-2">📈 Pollution Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pm25" stroke="#ff4d4d" name="PM2.5" />
              <Line type="monotone" dataKey="pm10" stroke="#ffa500" name="PM10" />
              <Line type="monotone" dataKey="o3" stroke="#1e90ff" name="O₃" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Latest Report */}
      {latestReport && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">📝 Latest Health Report</h2>
          <ReactMarkdown>{latestReport}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default PremiumPage;
