// src/components/PollutionInfo.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PollutionInfo.css"; 

// WHO safe limits for common pollutants
const WHO_LIMITS = {
  pm2_5: 15, // PM2.5: Particulate Matter ≤ 2.5 µm
  pm10: 45,  // PM10: Particulate Matter ≤ 10 µm
  co: 4000,  // CO: Carbon Monoxide
  no2: 200,  // NO2: Nitrogen Dioxide
  o3: 100    // O3: Ozone
};

// Full forms / explanation for user clarity
const POLLUTANT_FULL_NAMES = {
  pm2_5: "PM2.5 (Fine Particulate Matter ≤ 2.5 µm)",
  pm10: "PM10 (Coarse Particulate Matter ≤ 10 µm)",
  co: "CO (Carbon Monoxide)",
  no2: "NO2 (Nitrogen Dioxide)",
  o3: "O3 (Ozone)"
};

const PollutionInfo = ({ user }) => {
  const [pollution, setPollution] = useState(null);
  const [error, setError] = useState("");

  const fetchPollution = async (lat, lon, city) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );

      const comp = res.data.list[0].components;

      const data = { 
        city, lat, lon, 
        pm2_5: comp.pm2_5, 
        pm10: comp.pm10, 
        co: comp.co, 
        no2: comp.no2, 
        o3: comp.o3 
      };

      // Optional: save to backend for analytics
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save_pollution`, data);

      setPollution(data);
    } catch {
      setError("❌ Failed to fetch pollution data. Please check your internet connection or city name.");
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("⚠️ Geolocation not supported by your browser. Please enter your city.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await fetchPollution(coords.latitude, coords.longitude, user.city);
      },
      async () => {
        // fallback: use city name to fetch coordinates
        try {
          const geo = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${user.city}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
          );
          const { lat, lon } = geo.data[0];
          await fetchPollution(lat, lon, user.city);
        } catch {
          setError("⚠️ Could not determine location from city. Please enter a valid city.");
        }
      }
    );
  };

  useEffect(() => {
    if (user) getLocation();
  }, [user]);

  if (!user) return <p className="text-center mt-6 text-gray-400"></p>;
  if (error) return <p className="text-red-500 text-center mt-5">{error}</p>;
  if (!pollution) return <p className="text-center text-gray-400 mt-6">Loading pollution info...</p>;

  return (
    <div className="pollution-container">
      <h2 className="pollution-title">🌍 Air Pollution in {pollution.city}</h2>
      <p className="pollution-description">
        This table shows current levels of common air pollutants in your area compared to the safe limits recommended by the World Health Organization (WHO).
      </p>

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
              <td className="pollutant-name" title={POLLUTANT_FULL_NAMES[key]}>
                {key.toUpperCase()}
              </td>
              <td className={pollution[key] > WHO_LIMITS[key] ? "value-bad" : "value-good"}>
                {pollution[key]}
              </td>
              <td className="limit-value">{WHO_LIMITS[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="pollution-note">
        ⚠️ Values above WHO limits are considered harmful to health. Take precautions like wearing masks or using air purifiers if necessary.
      </p>
    </div>
  );
};

export default PollutionInfo;
