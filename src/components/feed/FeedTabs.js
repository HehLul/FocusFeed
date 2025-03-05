// components/feed/FeedTabs.jsx
import React from 'react';

const FeedTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-800">
        <nav className="flex -mb-px">
          <button
            onClick={() => onTabChange('latest')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'latest' 
                ? 'border-red-500 text-red-500' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Latest Videos
          </button>
          <button
            onClick={() => onTabChange('top')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'top' 
                ? 'border-red-500 text-red-500' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Top Videos
          </button>
        </nav>
      </div>
    </div>
  );
};

export default FeedTabs;