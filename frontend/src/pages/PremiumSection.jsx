// PremiumSection.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { saveAs } from "file-saver";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

const containerStyle = {
  maxWidth: 980,
  margin: "20px auto",
  padding: 16,
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
};

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 6px 18px rgba(12, 23, 40, 0.06)",
  marginBottom: 16,
};

const badge = (color) => ({
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  marginRight: 8,
  fontSize: 13,
  background: color,
  color: "#fff",
});

const backendBase = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

function getAQIColor(aqi) {
  if (aqi <= 50) return "#4CAF50";
  if (aqi <= 100) return "#FFEB3B";
  if (aqi <= 150) return "#FF9800";
  if (aqi <= 200) return "#F44336";
  if (aqi <= 300) return "#9C27B0";
  return "#212121";
}

export default function PremiumSection({ userData }) {
  const [report, setReport] = useState("No premium report yet");
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData) return;
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const lat = userData.lat;
        const lon = userData.lon;

        if (lat && lon) {
          const res = await axios.get(`${backendBase}/live_aqi`, {
            params: { lat, lon },
            timeout: 15000,
          });
          if (!cancelled) setAqiData(res.data);

          const rpt = await axios.post(`${backendBase}/generate_report`, { lat, lon }, { timeout: 20000 });
          if (!cancelled) setReport(rpt.data?.report ?? "No AI insights available");
        }
      } catch (e) {
        console.error("Premium data error:", e.response?.status, e.response?.data || e.message);
        if (!cancelled) setReport("⚠️ Failed to load premium report. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [userData]);

  const compositionData = useMemo(() => {
    if (!aqiData?.components) return [];
    return Object.entries(aqiData.components).map(([k, v]) => ({ pollutant: k.toUpperCase(), value: v }));
  }, [aqiData]);

  const trend7d = useMemo(() => {
    if (!aqiData?.forecast?.daily) return [];
    const { pm25 = [], pm10 = [] } = aqiData.forecast.daily;
    return pm25.map((day, i) => ({
      day: new Date(day.day).toLocaleDateString([], { month: "short", day: "numeric" }),
      pm25: day.avg,
      pm10: pm10[i]?.avg ?? null,
    }));
  }, [aqiData]);

  const uvTrend = useMemo(() => {
    if (!aqiData?.forecast?.daily?.uvi) return [];
    return aqiData.forecast.daily.uvi.map((day) => ({
      day: new Date(day.day).toLocaleDateString([], { month: "short", day: "numeric" }),
      uvi: day.avg,
    }));
  }, [aqiData]);

  const downloadReport = () => {
    const body = `Premium Health Report
Generated: ${new Date().toLocaleString()}
User: ${userData?.name}
Location: ${userData?.lat}, ${userData?.lon}

Current AQI: ${aqiData?.aqi ?? "N/A"}
Dominant Pollutant: ${aqiData?.dominantpol ?? "N/A"}
Pollutants: ${JSON.stringify(aqiData?.components ?? {}, null, 2)}

---
${report}`;
    saveAs(new Blob([body], { type: "text/plain;charset=utf-8" }), `PremiumReport_${userData?.name || "user"}.txt`);
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>🌟 Premium Health Insights</h2>
          {aqiData?.aqi && <span style={badge(getAQIColor(aqiData.aqi))}>AQI: {aqiData.aqi}</span>}
          {aqiData?.dominantpol && <span style={badge("#2196F3")}>Dominant: {aqiData.dominantpol.toUpperCase()}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={downloadReport}>💾 Download</button>
          <button onClick={() => window.location.reload()}>🔄 Refresh</button>
        </div>
      </div>

      <div style={card}>
        <h3>Personalized AI Health Analysis</h3>
        {loading ? <p>⏳ Generating…</p> : <ReactMarkdown>{report}</ReactMarkdown>}
      </div>

      <div style={card}>
        <h3>Live Pollutant Composition</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={compositionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pollutant" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <h3>7-Day AQI Forecast (PM2.5 vs PM10)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend7d}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pm25" stroke="#f44336" strokeWidth={2} />
            <Line type="monotone" dataKey="pm10" stroke="#2196f3" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={card}>
        <h3>UV Index Forecast</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={uvTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="uvi" fill="#ff9800" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
