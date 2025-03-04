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
import VideoCard from '@/components/feed/VideoCard';

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
  const loadFeaturedPlaylists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      // Fetch playlists with their videos and thumbnails
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select(`
          id,
          title,
          description,
          created_at,
          playlist_videos (
            position,
            video:youtube_videos (
              id,
              title,
              thumbnail_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
  
      if (playlistError) throw playlistError;
  
      // Transform the data
      const transformedPlaylists = playlistData.map(playlist => ({
        id: playlist.id,
        name: playlist.title,
        description: playlist.description,
        videoCount: playlist.playlist_videos.length,
        thumbnails: playlist.playlist_videos
          .sort((a, b) => a.position - b.position)
          .map(pv => pv.video?.thumbnail_url)
          .filter(Boolean)
          .slice(0, 4),
        featured: false
      }));
  
      setPlaylists(transformedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
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
 // Replace your current handleCreatePlaylist with this:
const handleCreatePlaylist = async (playlistData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, create the playlist
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .insert({
        user_id: user.id,
        title: playlistData.name,
        description: playlistData.description
      })
      .select()
      .single();

    if (playlistError) throw playlistError;

    // If videos were provided, add them to the playlist
    if (playlistData.videoUrls && playlistData.videoUrls.length > 0) {
      // First ensure the videos exist in youtube_videos table
      for (let i = 0; i < playlistData.videoUrls.length; i++) {
        const videoUrl = playlistData.videoUrls[i];
        // Extract video ID from URL (you'll need to implement this based on your URL format)
        const videoId = extractVideoId(videoUrl);
        
        // Insert video if it doesn't exist
        const { error: videoError } = await supabase
          .from('youtube_videos')
          .upsert({
            id: videoId,
            title: `Video ${i + 1}`, // Placeholder title
            thumbnail_url: '/default-thumbnail.png', // Placeholder thumbnail
            // Add other required fields with placeholder values
            channel_title: 'Unknown Channel',
            description: '',
            view_count: 0,
            published_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (videoError) console.error('Error upserting video:', videoError);

        // Add to playlist_videos with position
        const { error: playlistVideoError } = await supabase
          .from('playlist_videos')
          .insert({
            playlist_id: playlist.id,
            video_id: videoId,
            position: i
          });

        if (playlistVideoError) console.error('Error adding video to playlist:', playlistVideoError);
      }
    }

    // Add the new playlist to state
    const newPlaylist = {
      id: playlist.id,
      name: playlist.title,
      description: playlist.description,
      videoCount: playlistData.videoUrls?.length || 0,
      thumbnails: [],
      featured: false
    };

    setPlaylists(prev => [newPlaylist, ...prev]);
    setShowCreatePlaylistModal(false);
    
    return true;
  } catch (error) {
    console.error('Error creating playlist:', error);
    alert('Failed to create playlist. Please try again.');
    return false;
  }
};

// Helper function to extract video ID from URL
const extractVideoId = (url) => {
  try {
    // Handle different URL formats
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.substring(1);
    }
    return url; // fallback to using the whole URL if can't extract ID
  } catch (e) {
    console.error('Error parsing URL:', e);
    return url;
  }
};
  const handlePlaylistClick = (playlistId) => {
    router.push(`/playlist/${playlistId}`);
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