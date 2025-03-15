// components/feed/VideoSection.jsx
import React from "react";
import VideoCard from "./VideoCard";
import VideoSkeleton from "./VideoSkeletonLoader";

const VideoSection = ({ title, videos, isLoading, onRefresh }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          <span className="text-green-400">{title}</span>
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${
            isLoading
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 transition-colors"
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <VideoSkeleton />
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
          <p className="text-gray-400">
            We couldn't find any videos from your selected channels.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            This could be due to API rate limits or network issues. Please try
            refreshing later.
          </p>
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 transition-colors rounded text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoSection;
