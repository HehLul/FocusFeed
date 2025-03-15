// components/collection/CollectionHeader.jsx
import React from "react";
import Link from "next/link";

export default function CollectionHeader({ collection, onBack }) {
  // Helper function to determine purpose tag style
  const getPurposeStyle = () => {
    const purposeColors = {
      motivation: "bg-orange-900 text-orange-200",
      inspiration: "bg-purple-900 text-purple-200",
      learning: "bg-blue-900 text-blue-200",
      relaxation: "bg-green-900 text-green-200",
      rut: "bg-yellow-900 text-yellow-200",
      business: "bg-sky-900 text-sky-200",
    };

    return collection.purpose
      ? purposeColors[collection.purpose]
      : "bg-gray-800 text-gray-300";
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-6 border-l-4 border-green-500">
      <div className="flex items-center mb-1">
        <button
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-gray-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">{collection.title}</h1>

        {collection.purpose && (
          <span
            className={`ml-3 px-3 py-1 rounded-full text-xs ${getPurposeStyle()}`}
          >
            {collection.purpose.charAt(0).toUpperCase() +
              collection.purpose.slice(1)}
          </span>
        )}
      </div>

      <p className="text-gray-300 ml-9 mb-3">
        {collection.description || "No description"}
      </p>

      {collection.purpose_description && (
        <div className="ml-9 mt-2 bg-gray-800 p-3 rounded-md border-l-2 border-green-500">
          <h3 className="text-sm font-medium text-green-400 mb-1">
            When to use this collection:
          </h3>
          <p className="text-gray-300 text-sm">
            {collection.purpose_description}
          </p>
        </div>
      )}

      <div className="ml-9 mt-4 flex items-center text-sm text-gray-400">
        <span className="mr-4">
          <span className="font-medium">{collection.video_count || 0}</span>{" "}
          videos
        </span>

        <span>
          Created{" "}
          {collection.created_at
            ? new Date(collection.created_at).toLocaleDateString()
            : "recently"}
        </span>
      </div>
    </div>
  );
}
