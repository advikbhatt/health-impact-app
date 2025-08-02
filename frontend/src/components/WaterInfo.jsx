import React, { useEffect, useState } from "react";
import water1 from "../components/data/water/1.json";
import water2 from "../components/data/water/2.json";
import water3 from "../components/data/water/3.json";
import water4 from "../components/data/water/4.json";
import water5 from "../components/data/water/5.json";
import water6 from "../components/data/water/6.json";

import "./WaterInfo.css";

const allJson = [water1,water2,water3, water4,water5,water6];

const extractAllRows = () => {
  const allRows = [];

  allJson.forEach((file) => {
    file.pages?.forEach((page) => {
      page.tables?.forEach((table) => {
        if (Array.isArray(table.rows)) {
          allRows.push(...table.rows);
        }
      });
    });
  });

  return allRows;
};

const WaterInfo = ({ user }) => {
  const [headers, setHeaders] = useState([]);
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const allRows = extractAllRows();

      if (allRows.length < 5) {
        console.warn("Insufficient header rows.");
        return;
      }

      // Merge header from first 4 rows
      const headerRow = allRows[0].map((_, i) => {
        return (
          (allRows[0][i] || "") +
          " " +
          (allRows[1][i] || "") +
          " " +
          (allRows[2][i] || "") +
          " " +
          (allRows[3][i] || "")
        )
          .replace(/\s+/g, " ")
          .trim();
      });

      setHeaders(headerRow);

      const dataRows = allRows.slice(4);

      if (!user?.city && !user?.state) {
        console.warn("No user location provided.");
        setLoading(false);
        return;
      }

      const locationQuery = (user.city || user.state || "").toLowerCase();

      const matchedRow = dataRows.find((row) => {
        const location = row[1]?.toLowerCase() || "";
        const state = row[3]?.toLowerCase() || "";
        return location.includes(locationQuery) || state.includes(locationQuery);
      });

      if (matchedRow) {
        const data = {};
        headerRow.forEach((key, i) => {
          if (key && matchedRow[i]) {
            data[key] = matchedRow[i];
          }
        });
        setMatchingData(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading water data:", error);
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="water-info-container">
      <h3>Water Quality</h3>

      {loading ? (
        <p>Loading water quality data...</p>
      ) : !user?.city && !user?.state ? (
        <p>Please enter your city or state to view data.</p>
      ) : !matchingData ? (
        <p>No matching water data found for <b>{user.city || user.state}</b>.</p>
      ) : (
        <table className="water-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(matchingData).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WaterInfo;
