// components/feed/FeedTabs.jsx
import React from "react";

export default function FeedTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <button
        onClick={() => onTabChange("top")}
        className={`py-2 px-4 rounded-md transition-colors ${
          activeTab === "top"
            ? "bg-gray-800 text-green-400 font-medium"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Top Viewed
      </button>
      <button
        onClick={() => onTabChange("latest")}
        className={`py-2 px-4 rounded-md transition-colors ${
          activeTab === "latest"
            ? "bg-gray-800 text-green-400 font-medium"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Latest
      </button>
    </div>
  );
}
