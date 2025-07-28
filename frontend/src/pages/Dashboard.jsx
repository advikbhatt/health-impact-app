import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [table, setTable] = useState([]);

  useEffect(() => {
    const city = localStorage.getItem("profileCity");
    if (city && localStorage.getItem("pollutionFetched") === "true") {
      fetch(`http://localhost:8000/compare_pollution/${city}`)
        .then((res) => res.json())
        .then((cmp) => setTable(cmp));
    }
  }, []);

  if (!table.length) return null;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">📊 Pollution vs WHO</h2>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Pollutant</th>
            <th className="border px-4 py-2">Value</th>
            <th className="border px-4 py-2">WHO Limit</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {table.map((r) => (
            <tr key={r.pollutant}>
              <td className="border px-4 py-2">{r.pollutant.toUpperCase()}</td>
              <td className="border px-4 py-2">{r.value}</td>
              <td className="border px-4 py-2">{r.who_limit}</td>
              <td className="border px-4 py-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
