// components/feed/PlaylistSection.jsx
import React from "react";
import PlaylistCard from "./PlaylistCard";

export default function PlaylistSection({
  playlists,
  onCreatePlaylist,
  onPlaylistClick,
}) {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          Your <span className="text-green-400">Playlists</span>
        </h3>
        <button
          onClick={onCreatePlaylist}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-lg flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800">
          <p className="text-gray-400 mb-4">
            You haven't created any playlists yet.
          </p>
          <button
            onClick={onCreatePlaylist}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-lg"
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={() => onPlaylistClick(playlist.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
