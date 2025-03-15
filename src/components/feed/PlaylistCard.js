// components/feed/PlaylistCard.jsx
import React from "react";

export default function PlaylistCard({ playlist, onClick }) {
  const { name, description, videoCount, thumbnails } = playlist;

  return (
    <div
      onClick={onClick}
      className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer border border-gray-800 hover:border-green-500 transition-colors"
    >
      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 gap-px bg-black">
        {thumbnails && thumbnails.length > 0
          ? thumbnails.slice(0, 4).map((thumbnail, index) => (
              <div key={index} className="aspect-video overflow-hidden">
                <img
                  src={thumbnail}
                  alt={`Playlist thumbnail ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.target.src = "/default-thumbnail.png";
                  }}
                />
              </div>
            ))
          : // Empty thumbnails placeholder
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-video bg-gray-800"></div>
            ))}
      </div>

      {/* Playlist Info */}
      <div className="p-4">
        <h4 className="font-semibold mb-1 text-white">{name}</h4>
        {description && (
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">
            {description}
          </p>
        )}
        <p className="text-green-400 text-sm font-medium">
          {videoCount} {videoCount === 1 ? "video" : "videos"}
        </p>
      </div>
    </div>
  );
}
