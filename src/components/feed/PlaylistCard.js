import { useRouter } from "next/navigation";
import { Music } from "lucide-react"; // Import the Music icon for fallback
import { useState, useEffect } from "react";

export default function PlaylistCard({ playlist }) {
  const router = useRouter();
  const [imageStatuses, setImageStatuses] = useState({});

  // Debug info on mount
  useEffect(() => {
    console.log(`PlaylistCard mounted for: ${playlist.name}`, {
      id: playlist.id,
      thumbnails: playlist.thumbnails,
      thumbnailCount: playlist.thumbnails?.length || 0,
    });

    // Pre-check the thumbnails
    if (playlist.thumbnails && playlist.thumbnails.length > 0) {
      Promise.all(
        playlist.thumbnails.map((url, i) => {
          // Skip empty URLs
          if (!url) return Promise.resolve({ index: i, status: "empty" });

          // Test if the image can be loaded
          return fetch(url, { method: "HEAD" })
            .then((response) => ({
              index: i,
              status: response.ok ? "ok" : "error",
              statusCode: response.status,
            }))
            .catch((err) => ({
              index: i,
              status: "error",
              error: err.message,
            }));
        })
      ).then((results) => {
        const statuses = {};
        results.forEach((result) => {
          statuses[result.index] = result;
        });
        console.log(
          `Image status check for playlist "${playlist.name}":`,
          statuses
        );
        setImageStatuses(statuses);
      });
    }
  }, [playlist]);

  const handleClick = () => {
    router.push(`/playlist/${playlist.id}`);
  };

  // Handle image error
  const handleImageError = (e, index) => {
    console.error(
      `Error loading image at index ${index} for playlist "${playlist.name}"`,
      {
        src: e.target.src,
        naturalWidth: e.target.naturalWidth,
        naturalHeight: e.target.naturalHeight,
      }
    );
    e.target.src = "/default-thumbnail.png";

    // Update the status
    setImageStatuses((prev) => ({
      ...prev,
      [index]: { index, status: "error-display", src: e.target.src },
    }));
  };

  // Log successful image loads
  const handleImageLoad = (e, index) => {
    console.log(
      `Successfully loaded image at index ${index} for playlist "${playlist.name}"`,
      {
        src: e.target.src,
        naturalWidth: e.target.naturalWidth,
        naturalHeight: e.target.naturalHeight,
      }
    );

    // Update the status
    setImageStatuses((prev) => ({
      ...prev,
      [index]: { index, status: "loaded", src: e.target.src },
    }));
  };

  // Default thumbnail for empty slots
  const defaultThumbnail = "/default-thumbnail.png"; // Make sure this exists in your public folder

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-gray-800/50 hover:bg-gray-800 transition-colors"
    >
      {/* Debug info */}
      {process.env.NODE_ENV !== "production" && (
        <div className="bg-red-700 text-white text-xs p-1 hidden">
          Thumbnails: {playlist.thumbnails?.length || 0}
        </div>
      )}

      {/* Playlist thumbnail grid */}
      <div className="relative aspect-video bg-gray-900">
        {playlist.thumbnails?.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 p-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-video relative bg-gray-800 overflow-hidden"
              >
                {playlist.thumbnails[i] ? (
                  <img
                    src={playlist.thumbnails[i]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => handleImageError(e, i)}
                    onLoad={(e) => handleImageLoad(e, i)}
                    crossOrigin="anonymous" // Try with CORS handling
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Video count badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
          {playlist.videoCount || 0}{" "}
          {playlist.videoCount === 1 ? "video" : "videos"}
        </div>
      </div>

      {/* Playlist info */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 group-hover:text-white transition-colors line-clamp-1">
          {playlist.name || playlist.title || "Untitled Playlist"}
        </h3>
        {playlist.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {playlist.description}
          </p>
        )}
      </div>
    </div>
  );
}
