// components/feed/CollectionCard.jsx
import React from "react";

export default function CollectionCard({ collection, onClick }) {
  // Helper function to determine background gradient based on purpose
  const getGradientClass = () => {
    if (!collection.purpose) return "from-gray-800 to-gray-900";

    const purposeGradients = {
      motivation: "from-orange-700 to-red-800",
      inspiration: "from-purple-700 to-pink-800",
      learning: "from-blue-700 to-indigo-800",
      relaxation: "from-green-700 to-emerald-800",
      rut: "from-yellow-700 to-amber-800",
      business: "from-sky-700 to-cyan-800",
    };

    return purposeGradients[collection.purpose] || "from-gray-800 to-gray-900";
  };

  return (
    <div
      className="bg-gray-900 border border-gray-800 hover:border-green-500 transition-all duration-200 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
      onClick={onClick}
    >
      {/* Thumbnails grid */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-0.5">
          {collection.thumbnails && collection.thumbnails.length > 0
            ? collection.thumbnails.slice(0, 4).map((thumbnail, index) => (
                <div key={index} className="aspect-video bg-gray-800 relative">
                  <img
                    src={thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-thumbnail.png";
                    }}
                  />
                </div>
              ))
            : // Empty thumbnails placeholder
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-gray-800 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                  </div>
                ))}
        </div>

        {/* Overlay for featured collections */}
        {collection.featured && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getGradientClass()} opacity-40`}
          ></div>
        )}

        {/* Pill badge for featured collections */}
        {collection.featured && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
            Curated
          </div>
        )}
      </div>

      {/* Collection details */}
      <div className="p-4">
        <h4 className="text-lg font-semibold mb-1 text-white group-hover:text-green-400 transition-colors">
          {collection.name}
        </h4>

        <p className="text-gray-400 text-sm mb-3">
          {collection.videoCount || 0} videos
        </p>

        {collection.description && (
          <p className="text-gray-300 text-sm mb-2">{collection.description}</p>
        )}

        {/* Purpose explanation for featured collections */}
        {collection.featured && collection.purposeDescription && (
          <div className="bg-gray-800 p-3 rounded-md mt-2">
            <p className="text-xs text-gray-300">
              <span className="font-medium text-green-400">Best for: </span>
              {collection.purposeDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
