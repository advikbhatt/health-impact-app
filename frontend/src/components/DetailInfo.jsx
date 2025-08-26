import React, { useState } from "react";
import "./DetailInfo.css";

const DetailInfo = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const features = [
    "Multi-dimensional pollution data monitoring (air, water, land, sound)",
    "Personalized health impact forecasts based on age and exposure",
    "Short-term and long-term risk assessment",
    "Interactive visualizations and easy-to-understand reports",
    "Prevention tips and safety recommendations",
  ];

  return (
    <section className="detail-section max-w-4xl mx-auto my-6 p-4 sm:p-6 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="header bg-gradient-to-r from-green-400 to-blue-500 p-4 sm:p-6 rounded-xl shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white animate-fadeIn">
          Comprehensive Pollution Analysis App
        </h1>
        <p className={`text-base sm:text-lg text-white opacity-90 ${expanded ? "max-h-full" : "max-h-24 overflow-hidden"} transition-all duration-500`}>
          Our application monitors pollution across air, water, land, and sound. 
          It tracks real-time levels and forecasts health impacts tailored to your profile.
        </p>
        {/* <button
          onClick={toggleExpand}
          className="mt-2 text-white font-semibold text-sm sm:text-base underline focus:outline-none"
        >
          {expanded ? "Show Less" : "Read More"}
        </button> */}
      </div>

      {/* Features */}
      <div className="features bg-white rounded-xl shadow-md p-4 sm:p-6 mt-4 sm:mt-6 animate-slideUp">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-800">Services Provided</h2>
        <ul className="space-y-2">
          {features.map((item, index) => (
            <li key={index} className="flex items-start feature-item text-sm sm:text-base">
              <span className="text-green-600 mr-2 mt-1">✔</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing */}
      <div className="pricing mt-4 sm:mt-6 p-3 sm:p-4 bg-teal-50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-start shadow-md animate-fadeIn">
        <span className="text-xl sm:text-2xl font-bold text-teal-700">₹85</span>
        <p className="ml-0 sm:ml-3 text-teal-800 font-medium mt-1 sm:mt-0">
          for one deep dive analysis
        </p>
      </div>
    </section>
  );
};

export default DetailInfo;
