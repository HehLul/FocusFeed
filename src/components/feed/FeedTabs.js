// components/feed/FeedTabs.jsx
import React from "react";

export default function FeedTabs({ activeTab, onTabChange }) {
  return (
    <div className="mb-6 border-b border-gray-800">
      <div className="flex space-x-6">
        <button
          onClick={() => onTabChange("latest")}
          className={`pb-3 px-1 text-lg font-medium border-b-2 transition-colors ${
            activeTab === "latest"
              ? "border-green-500 text-green-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Latest Videos
        </button>
        <button
          onClick={() => onTabChange("top")}
          className={`pb-3 px-1 text-lg font-medium border-b-2 transition-colors ${
            activeTab === "top"
              ? "border-green-500 text-green-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Top Videos
        </button>
      </div>
    </div>
  );
}
