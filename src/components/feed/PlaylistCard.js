import { useRouter } from 'next/navigation';

export default function PlaylistCard({ playlist }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/playlist/${playlist.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-gray-800/50 hover:bg-gray-800 transition-colors"
    >
      {/* Playlist thumbnail grid */}
      <div className="relative aspect-video bg-gray-900">
        {playlist.thumbnails?.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 p-1">
            {playlist.thumbnails.slice(0, 4).map((url, i) => (
              <div key={i} className="aspect-video relative bg-gray-800">
                <img
                  src={url || '/default-thumbnail.png'}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p className="text-sm">Empty playlist</p>
          </div>
        )}
        
        {/* Video count badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
          {playlist.videoCount || 0} {(playlist.videoCount === 1) ? 'video' : 'videos'}
        </div>
      </div>

      {/* Playlist info */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 group-hover:text-white transition-colors line-clamp-1">
          {playlist.name || playlist.title || 'Untitled Playlist'}
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