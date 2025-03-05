// components/feed/PlaylistCard.jsx
import React from 'react';

const PlaylistCard = ({ playlist, onClick }) => {
  return (
    <div 
      className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-gray-800">
        {/* Playlist thumbnail or collage of videos */}
        {playlist.thumbnail ? (
          <img 
            src={playlist.thumbnail} 
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
        )}
        
        {/* Video count badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 text-xs rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          {playlist.videoCount || 0} videos
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-medium text-sm mb-1">{playlist.name}</h4>
        <p className="text-gray-400 text-xs line-clamp-2">{playlist.description}</p>
      </div>
    </div>
  );
};

export default PlaylistCard;