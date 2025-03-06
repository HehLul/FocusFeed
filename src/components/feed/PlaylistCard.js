import { useRouter } from "next/navigation";
import { Music } from "lucide-react"; // Import the Music icon for fallback

export default function PlaylistCard({ playlist }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/playlist/${playlist.id}`);
  };

  // Default thumbnail for empty slots
  const defaultThumbnail = "/default-thumbnail.png"; // Make sure this exists in your public folder

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-gray-800/50 hover:bg-gray-800 transition-colors"
    >
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
                    onError={(e) => {
                      e.target.src = defaultThumbnail;
                    }}
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
