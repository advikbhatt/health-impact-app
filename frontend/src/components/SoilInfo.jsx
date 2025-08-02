import React, { useEffect, useState } from "react";
import axios from "axios";
import "./InfoCard.css";

const SoilInfo = ({ user }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSoil = async () => {
      if (!user?.city) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get_soil/${user.city}`
        );
        setData(res.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch soil quality data.");
        setData([]);
      }
    };

    fetchSoil();
  }, [user]);

  return (
    <div className="info-container">
      <h2 className="info-title">🪨 Soil Quality</h2>
      {error && <p className="info-error">{error}</p>}
      <div className="info-grid">
        {data.map((item, index) => (
          <div
            key={index}
            className={`info-card ${
              item.status === "Safe" ? "safe" : "unsafe"
            }`}
          >
            <h3>{item.parameter}</h3>
            <p>Value: {item.value}</p>
            <p>Status: {item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoilInfo;
