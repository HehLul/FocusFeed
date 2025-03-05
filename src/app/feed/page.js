// app/feed/page.js
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import LoadingFeedAnimation from '@/components/LoadingFeedAnimation';

// Import components
import FeedHeader from '@/components/common/FeedHeader';
import DebugSession from '@/components/common/DebugSession';
import PlaylistSection from '@/components/feed/PlaylistSection';
import FeedTabs from '@/components/feed/FeedTabs';
import VideoSection from '@/components/feed/VideoSection';
import CreatePlaylistModal from '@/components/feed/CreatePlaylistModal';

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
      <FeedHeader 
        userEmail={user?.email} 
        onSignOut={handleSignOut} 
      />
      
      {/* Feed content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Your Focused Feed</h2>
        
        {/* Playlists Section */}
        <PlaylistSection 
          playlists={playlists}
          onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
          onPlaylistClick={handlePlaylistClick}
        />
        
        {/* Tabs for Latest and Top videos */}
        <FeedTabs 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab)} 
        />
        
        {/* Video Display */}
        <VideoSection
          title={activeTab === 'latest' ? 'Latest Videos' : 'Top Videos'}
          videos={videos[activeTab]}
          isLoading={videoLoading}
          onRefresh={fetchVideos}
        />
        
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
  );
}