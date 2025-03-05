// components/feed/VideoCard.jsx
import React from 'react';

const VideoCard = ({ video }) => {
  // Format view count for display
  const formatViewCount = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    } else {
      return `${views} views`;
    }
  };

  // Format published date for display
  const formatPublishedDate = (dateString) => {
    const publishedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - publishedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105">
      <a 
        href={`https://www.youtube.com/watch?v=${video.id}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full aspect-video object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-1 py-0.5 text-xs rounded">
            {video.duration}
          </div>
        </div>
        <div className="p-4">
          <h4 className="font-medium text-sm mb-2 line-clamp-2" title={video.title}>
            {video.title}
          </h4>
          <div className="flex items-center text-gray-400 text-xs">
            <span className="truncate">{video.channelTitle}</span>
            <span className="mx-1">•</span>
            <span>{formatViewCount(video.viewCount)}</span>
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {formatPublishedDate(video.publishedAt)}
          </div>
        </div>
      </a>
    </div>
  );
};

export default VideoCard;