// src/components/PollutionInfo.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/PollutionInfo.css"; 

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

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const fetchPollution = async (lat, lon, city) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
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
      };

      // 🔁 Save to backend (Render deployment)
      await axios.post(`${backendURL}/save_pollution`, data);
      setPollution(data);
    } catch (err) {
      console.error("Error fetching pollution:", err);
      setError("❌ Failed to fetch pollution data.");
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await fetchPollution(coords.latitude, coords.longitude, user.city);
      },
      async () => {
        try {
          const geo = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${user.city}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
          );
          const { lat, lon } = geo.data[0];
          await fetchPollution(lat, lon, user.city);
        } catch {
          setError("⚠️ Could not determine your location.");
        }
      }
    );
  };

  useEffect(() => {
    if (user) getLocation();
  }, [user]);

  if (!user)
    return <p className="text-center mt-6 text-gray-400">User data not submitted yet.</p>;
  if (error) return <p className="text-red-500 text-center mt-5">{error}</p>;
  if (!pollution)
    return <p className="text-center text-gray-400 mt-6">Loading pollution info...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold mb-4 text-center text-green-700">
        🌍 Pollution in {pollution.city}
      </h2>
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Pollutant</th>
            <th className="border px-4 py-2">Value (µg/m³)</th>
            <th className="border px-4 py-2">WHO Limit</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(WHO_LIMITS).map((key) => (
            <tr key={key}>
              <td className="border px-4 py-2">{key.replace("_", ".")}</td>
              <td
                className={`border px-4 py-2 ${
                  pollution[key] > WHO_LIMITS[key] ? "text-red-600 font-bold" : "text-green-600"
                }`}
              >
                {pollution[key]}
              </td>
              <td className="border px-4 py-2">{WHO_LIMITS[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PollutionInfo;
