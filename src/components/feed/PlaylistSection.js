// components/feed/PlaylistSection.jsx
import React from 'react';
import PlaylistCard from './PlaylistCard';

const PlaylistSection = ({ playlists, onCreatePlaylist, onPlaylistClick }) => {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your Playlists</h3>
        <button 
          onClick={onCreatePlaylist}
          className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Playlist
        </button>
      </div>
      
      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard 
              key={playlist.id} 
              playlist={playlist} 
              onClick={() => onPlaylistClick(playlist.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <p className="text-gray-400 mb-2">You don't have any playlists yet</p>
          <p className="text-gray-500 text-sm mb-4">Create your first playlist to begin organizing your focused content</p>
          <button 
            onClick={onCreatePlaylist}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
          >
            Create Your First Playlist
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaylistSection;