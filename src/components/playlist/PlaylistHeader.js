import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlaylistHeader({ playlist, videoCount }) {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-800 rounded-full transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Playlist info */}
      <div className="text-center px-12">
        <h1 className="text-2xl font-bold mb-2">{playlist.title}</h1>
        <p className="text-gray-400 mb-4">{playlist.description}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <span>{videoCount} videos</span>
          <span>•</span>
          <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}