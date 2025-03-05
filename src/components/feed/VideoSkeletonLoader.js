// components/feed/VideoSkeleton.jsx
import React from 'react';

const VideoSkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count).fill(null).map((_, index) => (
        <div key={index} className="bg-gray-900 rounded-lg overflow-hidden animate-pulse">
          {/* Thumbnail placeholder */}
          <div className="w-full aspect-video bg-gray-800"></div>
          
          {/* Content placeholder */}
          <div className="p-4">
            {/* Title placeholder */}
            <div className="h-4 bg-gray-800 rounded mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
            
            {/* Channel and views placeholder */}
            <div className="flex space-x-2">
              <div className="h-3 bg-gray-800 rounded w-1/3"></div>
              <div className="h-3 bg-gray-800 rounded w-1/4"></div>
            </div>
            
            {/* Date placeholder */}
            <div className="h-3 bg-gray-800 rounded w-1/5 mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoSkeletonLoader;