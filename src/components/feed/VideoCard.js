// components/feed/VideoCard.jsx
import { Video } from "lucide-react";

export default function VideoCard({
  video,
  index,
  showPlaylistNumber = false,
}) {
  // Accept both thumbnail and thumbnail_url
  const thumbnailUrl =
    video?.thumbnail || video?.thumbnail_url || "/default-thumbnail.png";

  return (
    <div className="flex gap-4 p-4 hover:bg-gray-800/50 rounded-lg transition-colors border border-gray-800 hover:border-green-500">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-48 h-27 bg-gray-900 rounded overflow-hidden">
        {showPlaylistNumber && (
          <div className="absolute left-2 top-2 bg-black/80 px-2 py-1 rounded text-sm z-10">
            {index}
          </div>
        )}

        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video?.title || "Video thumbnail"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/default-thumbnail.png";
              // If default thumbnail also fails, show icon
              e.target.onerror = () => {
                e.target.style.display = "none";
                const parent = e.target.parentElement;
                if (parent) {
                  const iconDiv = document.createElement("div");
                  iconDiv.className =
                    "w-full h-full flex items-center justify-center";
                  iconDiv.innerHTML =
                    '<svg class="w-8 h-8 text-gray-600" ...></svg>';
                  parent.appendChild(iconDiv);
                }
              };
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-600" />
          </div>
        )}
      </div>

      {/* Video info */}
      <div className="flex flex-col flex-grow min-w-0">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {video?.title || "Untitled video"}
        </h3>
        <p className="text-gray-400 text-sm mb-2">
          {video?.channel_title || "Unknown channel"}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{formatViews(video?.view_count)} views</span>
          {video?.published_at && (
            <>
              <span>•</span>
              <span>{formatDate(video.published_at)}</span>
            </>
          )}
        </div>
        {video?.description && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}

function formatViews(views) {
  if (!views && views !== 0) return "0";

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}
