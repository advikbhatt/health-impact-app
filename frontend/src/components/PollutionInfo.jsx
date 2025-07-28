// src/components/PollutionInfo.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const WHO_LIMITS = {
  pm2_5: 15, pm10: 45, co: 4000, no2: 200, o3: 100
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
      const data = { city, lat, lon, pm2_5: comp.pm2_5, pm10: comp.pm10, co: comp.co, no2: comp.no2, o3: comp.o3 };
      await axios.post("http://localhost:8000/save_pollution", data);
      setPollution(data);
    } catch {
      setError("❌ Failed to fetch pollution data.");
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => await fetchPollution(coords.latitude, coords.longitude, user.city),
      async () => {
        try {
          const geo = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${user.city}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
          );
          const { lat, lon } = geo.data[0];
          await fetchPollution(lat, lon, user.city);
        } catch {
          setError("⚠️ Could not get location.");
        }
      }
    );
  };

  useEffect(() => {
    if (user) getLocation();
  }, [user]);

  if (!user) return <p className="text-center mt-6 text-gray-400">User data not submitted yet.</p>;
  if (error) return <p className="text-red-500 text-center mt-5">{error}</p>;
  if (!pollution) return <p className="text-center text-gray-400 mt-6">Loading pollution info...</p>;

  return (
    <div className="mt-10 max-w-3xl mx-auto bg-[#1e293b] border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
      <h2 className="text-xl text-cyan-400 font-semibold p-4 border-b border-gray-600">🌍 Pollution in {pollution.city}</h2>
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-800 text-gray-300 uppercase">
          <tr><th className="p-3">Pollutant</th><th className="p-3">Value (µg/m³)</th><th className="p-3">WHO Limit</th></tr>
        </thead>
        <tbody>
          {Object.keys(WHO_LIMITS).map((key) => (
            <tr key={key} className="border-t border-gray-700">
              <td className="p-3 capitalize">{key.replace("_", ".")}</td>
              <td className={`p-3 font-bold ${pollution[key] > WHO_LIMITS[key] ? 'text-red-400' : 'text-green-400'}`}>
                {pollution[key]}
              </td>
              <td className="p-3 text-gray-400">{WHO_LIMITS[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PollutionInfo;
