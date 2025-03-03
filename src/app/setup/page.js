"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChannelSetup() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Improved thumbnail selection function
  const getChannelThumbnail = (channel) => {
    const defaultThumbnail = '/default-channel-thumbnail.png';

    try {
      const thumbnails = channel.snippet?.thumbnails;
      
      if (thumbnails) {
        // Preference order: high > medium > default
        if (thumbnails.high) return thumbnails.high.url;
        if (thumbnails.medium) return thumbnails.medium.url;
        if (thumbnails.default) return thumbnails.default.url;
      }

      return defaultThumbnail;
    } catch (error) {
      console.error('Thumbnail selection error:', error);
      return defaultThumbnail;
    }
  };

  // Debounce search to reduce API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        searchYouTubeChannels();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchYouTubeChannels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/youtube/search-channels?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      // Filter only channel results
      const channelResults = data.items.filter(item => 
        item.id.kind === 'youtube#channel'
      );

      // Process channels
      const processedChannels = channelResults.map((channel, index) => ({
        id: channel.id.channelId,
        uniqueKey: `${channel.id.channelId}-${index}`,
        title: channel.snippet.channelTitle,
        description: channel.snippet.description,
        thumbnailUrl: getChannelThumbnail(channel),
        rawChannel: channel
      }));

      setSearchResults(processedChannels);
    } catch (error) {
      console.error('Error searching YouTube channels:', error);
      setError(error.message || 'Failed to search channels');
    } finally {
      setIsLoading(false);
    }
  };

  const removeChannel = (channelId) => {
    setSelectedChannels(prev => 
      prev.filter(channel => channel.id !== channelId)
    );
  };

  const addChannel = (channel) => {
    // Prevent duplicate channels and limit to 10
    if (!selectedChannels.some(c => c.id === channel.id) && selectedChannels.length < 10) {
      setSelectedChannels(prev => [...prev, channel]);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const handleSubmit = async () => {
    if (selectedChannels.length < 3) {
      alert('Please select at least 3 channels');
      return;
    }

    try {
      const response = await fetch('/api/feed/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channels: selectedChannels.map(channel => ({
            id: channel.id,
            title: channel.title,
            thumbnail: channel.thumbnailUrl
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        router.push('/feed');
      } else {
        setError(result.message || 'Failed to create feed');
      }
    } catch (error) {
      console.error('Error creating feed:', error);
      setError('Failed to create feed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Curate Your YouTube Feed</h1>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Channel Search */}
        <div className="mb-8 relative">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search YouTube Channels"
            className="w-full p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-gray-900 rounded-lg max-h-60 overflow-y-auto">
              {searchResults.map(channel => (
                <div 
                  key={channel.uniqueKey}
                  className="flex items-center p-3 hover:bg-gray-800 cursor-pointer"
                  onClick={() => addChannel(channel)}
                >
                  <img 
                    src={channel.thumbnailUrl}
                    alt={channel.title}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    onError={(e) => {
                      e.target.src = '/default-channel-thumbnail.png';
                    }}
                  />
                  <div>
                    <p className="font-semibold">{channel.title}</p>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {channel.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Channels */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Selected Channels ({selectedChannels.length}/10)
          </h2>
          
          {selectedChannels.length === 0 ? (
            <p className="text-gray-400">
              Start searching and add at least 3 channels
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedChannels.map(channel => (
                <div 
                  key={channel.id} 
                  className="bg-gray-900 rounded-lg p-4 flex items-center"
                >
                  <img 
                    src={channel.thumbnailUrl}
                    alt={channel.title}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    onError={(e) => {
                      e.target.src = '/default-channel-thumbnail.png';
                    }}
                  />
                  <div className="flex-grow">
                    <p className="font-semibold truncate">{channel.title}</p>
                  </div>
                  <button 
                    onClick={() => removeChannel(channel.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove ${channel.title}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button 
            onClick={handleSubmit}
            disabled={selectedChannels.length < 3 || isLoading}
            className={`
              px-8 py-3 rounded-lg text-lg font-semibold 
              ${selectedChannels.length >= 3 && !isLoading
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            {isLoading ? 'Creating Feed...' : `Create My Feed (${selectedChannels.length}/10)`}
          </button>
        </div>
      </div>
    </div>
  );
}