// app/feed/page.js
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import LoadingFeedAnimation from '@/components/LoadingFeedAnimation';

// Components defined inline to resolve import issues
// You can move these to separate files later
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

// Playlist Card Component
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

// Create Playlist Modal Component
const CreatePlaylistModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrls, setVideoUrls] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Process video URLs - parse them to extract video IDs if needed
      const urls = videoUrls.split('\n').filter(url => url.trim() !== '');
      
      await onSubmit({
        name,
        description,
        videoUrls: urls
      });
      
      // Reset form after submission
      setName('');
      setDescription('');
      setVideoUrls('');
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      // You could add error handling/display here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 className="text-xl font-bold mb-4">Create New Playlist</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="playlist-name" className="block text-sm font-medium mb-1">
              Playlist Name
            </label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white"
              placeholder="e.g., Study Music"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="playlist-description" className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white h-20"
              placeholder="What is this playlist for?"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="video-urls" className="block text-sm font-medium mb-1">
              Video URLs (one per line)
            </label>
            <textarea
              id="video-urls"
              value={videoUrls}
              onChange={(e) => setVideoUrls(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white h-32"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste YouTube video URLs, one per line
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 text-sm bg-gray-800 hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium rounded ${
                isSubmitting 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function FeedPage() {
  const [user, setUser] = useState(null);
  const [userFeed, setUserFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('latest');
  const [videos, setVideos] = useState({ latest: [], top: [] });
  const [videoLoading, setVideoLoading] = useState(false);
  
  // Playlists state
  const [playlists, setPlaylists] = useState([]);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    console.log("Feed page mounted - checking authentication");
    let isMounted = true;
    
    // Check if user is authenticated and fetch their feed
    async function fetchUserAndFeed() {
      try {
        console.log("Fetching session data...");
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session result:", session ? "Active session found" : "No session found");
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (!session) {
          console.log("No session, redirecting to home");
          // Redirect with a slight delay to allow logging to complete
          setTimeout(() => {
            if (isMounted) router.push('/');
          }, 100);
          return;
        }
        console.log("User authenticated:", session.user.email);
        if (isMounted) setUser(session.user);
        
        // Fetch the user's feed
        console.log("Fetching user feed for ID:", session.user.id);
        const { data: feedData, error: feedError } = await supabase
          .from('user_feeds')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (feedError) {
          console.error("Feed fetch error:", feedError);
          throw feedError;
        }
        
        console.log("Feed data retrieved:", feedData ? "Success" : "No data");
        if (isMounted) {
          setUserFeed(feedData);
          setLoading(false);
          
          // Load featured playlists
          loadFeaturedPlaylists();
        }
        
      } catch (error) {
        console.error('Error in feed page:', error);
        if (isMounted) setError(error.message);
        if (isMounted) setLoading(false);
      }
    }
    fetchUserAndFeed();
    
    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Load featured playlists
  const loadFeaturedPlaylists = () => {
    // Fetch from database in the future, but for now we'll use sample data
    const featuredPlaylists = [
      {
        id: 'study',
        name: 'Study Focus',
        description: 'Concentration-enhancing videos for productive study sessions',
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
        videoCount: 12,
        featured: true
      },
      {
        id: 'motivation',
        name: 'Morning Motivation',
        description: 'Start your day with positivity and energy',
        thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
        videoCount: 8,
        featured: true
      },
      {
        id: 'rut',
        name: 'Get Out of a Rut',
        description: 'Inspiring content for when you feel stuck',
        thumbnail: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
        videoCount: 5,
        featured: true
      }
    ];
    
    setPlaylists(featuredPlaylists);
  };

  // Fetch videos when userFeed is loaded
  useEffect(() => {
    if (userFeed?.channels && userFeed.channels.length > 0) {
      fetchVideos();
    }
  }, [userFeed]);

  const fetchVideos = async () => {
    if (!userFeed?.channels || userFeed.channels.length === 0) return;
    
    setVideoLoading(true);
    
    try {
      // Prepare channel IDs for API call
      const channelIds = userFeed.channels.map(channel => channel.id);
      
      // Fetch latest videos with a timeout to prevent hanging requests
      const fetchLatestVideos = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch('/api/youtube/videos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              channelIds,
              order: 'date', // Order by date for latest videos
              maxResults: 20 // Fetch up to 20 videos
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch latest videos');
          }
          
          return await response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Error fetching latest videos:', error);
          throw error;
        }
      };
      
      // Fetch top videos with a timeout
      const fetchTopVideos = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch('/api/youtube/videos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              channelIds,
              order: 'viewCount', // Order by view count for top videos
              maxResults: 20 // Fetch up to 20 videos
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch top videos');
          }
          
          return await response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Error fetching top videos:', error);
          throw error;
        }
      };
      
      // Execute both fetch requests in parallel
      const [latestData, topData] = await Promise.allSettled([
        fetchLatestVideos(),
        fetchTopVideos()
      ]);
      
      // Process results, handling any failures
      setVideos({
        latest: latestData.status === 'fulfilled' ? latestData.value.videos || [] : [],
        top: topData.status === 'fulfilled' ? topData.value.videos || [] : []
      });
      
      // Check if we had any failures
      if (latestData.status === 'rejected' && topData.status === 'rejected') {
        console.error('Both video fetches failed:', latestData.reason, topData.reason);
        throw new Error('Failed to fetch videos. This might be due to YouTube API rate limiting.');
      }
      
    } catch (error) {
      console.error('Error in fetchVideos:', error);
      // We don't show an error message on the UI as the empty state will handle this
    } finally {
      setVideoLoading(false);
    }
  };

  // Handle playlist creation
  const handleCreatePlaylist = async (playlistData) => {
    try {
      // In the future, this should save to the database
      console.log('Creating playlist with data:', playlistData);
      
      // For now, we'll just add it to the local state
      const newPlaylist = {
        id: `custom-${Date.now()}`,
        name: playlistData.name,
        description: playlistData.description,
        videoCount: playlistData.videoUrls.length,
        featured: false,
        // We would normally generate a thumbnail based on the videos
        thumbnail: null
      };
      
      setPlaylists([...playlists, newPlaylist]);
      
      // Show success message (could use a toast notification)
      alert('Playlist created successfully!');
      
      return true;
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist. Please try again.');
      return false;
    }
  };

  const handlePlaylistClick = (playlistId) => {
    // In the future, this should navigate to the playlist page
    console.log('Navigate to playlist:', playlistId);
    alert(`Navigating to playlist ${playlistId} (Coming soon)`);
    // router.push(`/playlist/${playlistId}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Handle tab change
  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  // Debug component to show raw session data
  const DebugSession = () => {
    const [sessionData, setSessionData] = useState("Loading...");
    
    useEffect(() => {
      async function getSessionDebug() {
        const { data } = await supabase.auth.getSession();
        setSessionData(JSON.stringify(data, null, 2));
      }
      getSessionDebug();
    }, []);
    
    return (
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-mono mb-2">Session Debug:</h3>
        <pre className="text-xs overflow-auto max-h-60">{sessionData}</pre>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingFeedAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Your Feed</h2>
        <p className="mb-6">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-white text-black rounded"
        >
          Return to Home
        </button>
        
        {/* Include debug info in error state */}
        <DebugSession />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with user email */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold">FocusFeed</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{user?.email}</span>
            <button 
              onClick={handleSignOut}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      {/* Feed content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Your Focused Feed</h2>
        
        {/* Playlists Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Your Playlists</h3>
            <button 
              onClick={() => setShowCreatePlaylistModal(true)}
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
                  onClick={() => handlePlaylistClick(playlist.id)}
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
                onClick={() => setShowCreatePlaylistModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
              >
                Create Your First Playlist
              </button>
            </div>
          )}
        </div>
        
        {/* Tabs for Latest and Top videos */}
        <div className="mb-6">
          <div className="border-b border-gray-800">
            <nav className="flex -mb-px">
              <button
                onClick={() => changeTab('latest')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'latest' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Latest Videos
              </button>
              <button
                onClick={() => changeTab('top')}
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
        
        {/* Video Display */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {activeTab === 'latest' ? 'Latest Videos' : 'Top Videos'}
            </h3>
            <button
              onClick={fetchVideos}
              disabled={videoLoading}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${
                videoLoading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {videoLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
          
          {videoLoading ? (
            // Skeleton loader for better UX during loading
            <div>
              {/* Skeleton loader component defined inline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(null).map((_, index) => (
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
            </div>
          ) : videos[activeTab].length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos[activeTab].map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">
                {activeTab === 'latest' 
                  ? "We couldn't find any recent videos from your selected channels." 
                  : "We couldn't find any popular videos from your selected channels."}
              </p>
              <p className="text-gray-500 mt-2 text-sm">
                This could be due to API rate limits or network issues. Please try refreshing later.
              </p>
              <button
                onClick={fetchVideos}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        {/* Debug section - remove in production */}
        {process.env.NODE_ENV !== 'production' && <DebugSession />}
      </main>
      
      {/* Create Playlist Modal */}
      <CreatePlaylistModal 
        isOpen={showCreatePlaylistModal}
        onClose={() => setShowCreatePlaylistModal(false)}
        onSubmit={handleCreatePlaylist}
      />
    </div>
  );}