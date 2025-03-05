// components/common/FeedHeader.jsx
import React from 'react';

const FeedHeader = ({ userEmail, onSignOut }) => {
  return (
    <header className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">FocusFeed</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{userEmail}</span>
          <button 
            onClick={onSignOut}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default FeedHeader;