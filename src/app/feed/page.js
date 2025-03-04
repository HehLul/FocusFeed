// app/feed/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import LoadingFeedAnimation from '@/components/LoadingFeedAnimation';

export default function FeedPage() {
  const [user, setUser] = useState(null);
  const [userFeed, setUserFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        if (isMounted) setUserFeed(feedData);
        
      } catch (error) {
        console.error('Error in feed page:', error);
        if (isMounted) setError(error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUserAndFeed();

    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
        
        {/* Channel list */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Your Channels</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userFeed?.channels.map((channel) => (
              <div key={channel.id} className="bg-gray-900 p-4 rounded-lg">
                <img 
                  src={channel.thumbnail || '/default-channel-thumbnail.png'} 
                  alt={channel.title}
                  className="w-full aspect-square object-cover rounded-full mb-2"
                  onError={(e) => {
                    e.target.src = '/default-channel-thumbnail.png';
                  }}
                />
                <p className="text-sm text-center truncate">{channel.title}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Feed videos (placeholder for now) */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Latest Videos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This would be populated with actual videos in the future */}
            <div className="col-span-full bg-gray-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">
                Your personalized video feed is coming soon! We're working on fetching the latest content from your selected channels.
              </p>
              <p className="text-gray-500 mt-2 text-sm">
                No algorithmic distractions - just the content you've chosen to focus on.
              </p>
            </div>
          </div>
        </div>
        
        {/* Debug section - remove in production */}
        {process.env.NODE_ENV !== 'production' && <DebugSession />}
      </main>
    </div>
  );
}