// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const [table, setTable] = useState([]);

  useEffect(() => {
    const city = localStorage.getItem("profileCity");
    if (city && localStorage.getItem("pollutionFetched") === "true") {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/compare_pollution/${city}`)
        .then((res) => res.json())
        .then((cmp) => setTable(cmp));
    }
  }, []);

  if (!table.length) return null;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">📊 Pollution vs WHO</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Pollutant</th>
            <th>Value (µg/m³)</th>
            <th>WHO Limit</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {table.map((r) => (
            <tr key={r.pollutant}>
              <td>{r.pollutant.toUpperCase()}</td>
              <td>{r.value}</td>
              <td>{r.who_limit}</td>
              <td className={r.status === "Unsafe" ? "status-bad" : "status-good"}>
                {r.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
