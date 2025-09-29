// src/components/PollutionInfo.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PollutionInfo.css";

// WHO safe limits for common pollutants
const WHO_LIMITS = {
  pm2_5: 15,
  pm10: 45,
  co: 4000,
  no2: 200,
  o3: 100,
};

const PollutionInfo = ({ user }) => {
  const [pollution, setPollution] = useState(null);
  const [error, setError] = useState("");

  const fetchPollution = async (lat, lon, city) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${
          import.meta.env.VITE_OPENWEATHER_API_KEY
        }`
      );

      const comp = res.data.list[0].components;

      const data = {
        city,
        lat,
        lon,
        pm2_5: comp.pm2_5,
        pm10: comp.pm10,
        co: comp.co,
        no2: comp.no2,
        o3: comp.o3,
        timestamp: new Date().toISOString(),
        user_id: user?.uid || null,
      };

      console.log("🌍 Pollution fetched:", data);

      // 🔹 Try saving pollution data to backend
      try {
        const saveRes = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/save_pollution`,
          data
        );
        console.log("✅ Pollution saved:", saveRes.data);
      } catch (err) {
        console.warn("⚠️ Could not save pollution to backend:", err.response?.data || err.message);
      }

      setPollution(data);
    } catch (err) {
      console.error("❌ Pollution fetch failed:", err.message);
      setError("❌ Failed to fetch pollution data.");
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("⚠️ Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await fetchPollution(coords.latitude, coords.longitude, user.city);
      },
      async () => {
        try {
          const geo = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${user.city}&limit=1&appid=${
              import.meta.env.VITE_OPENWEATHER_API_KEY
            }`
          );
          const { lat, lon } = geo.data[0];
          await fetchPollution(lat, lon, user.city);
        } catch (err) {
          console.error("❌ City geolocation failed:", err.message);
          setError("⚠️ Could not determine location from city.");
        }
      }
    );
  };

  useEffect(() => {
    if (user?.city) getLocation();
  }, [user]);

  if (!user) return null;
  if (error) return <p className="text-red-500 text-center mt-5">{error}</p>;
  if (!pollution) return <p className="text-center text-gray-400 mt-6">Loading pollution info...</p>;

  return (
    <div className="pollution-container">
      <table className="pollution-table">
        <thead>
          <tr>
            <th>Pollutant</th>
            <th>Current Value (µg/m³)</th>
            <th>WHO Safe Limit (µg/m³)</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(WHO_LIMITS).map((key) => (
            <tr key={key}>
              <td className="pollutant-name">{key.toUpperCase()}</td>
              <td className={pollution[key] > WHO_LIMITS[key] ? "value-bad" : "value-good"}>
                {pollution[key]}
              </td>
              <td className="limit-value">{WHO_LIMITS[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PollutionInfo;
