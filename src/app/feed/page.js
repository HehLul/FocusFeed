// app/feed/page.jsx
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import LoadingFeedAnimation from '../../components/LoadingFeedAnimation';

export default function FeedPage() {
  const { user, signOut } = useAuth();
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        // Fetch user's feed configuration
        const { data, error } = await supabase
          .from('user_feeds')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        setFeedData(data);
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchFeedData();
    }
  }, [user]);
  
  if (loading) {
    return <LoadingFeedAnimation />;
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-900 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FocusFeed</h1>
          <button 
            onClick={signOut}
            className="text-white bg-transparent border border-white px-4 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-6">Your Personalized Feed</h2>
        
        {/* Display feed content here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* This would be populated with actual YouTube videos */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-800"></div>
            <div className="p-4">
              <h3 className="font-semibold">Video Title</h3>
              <p className="text-gray-400 text-sm">Channel Name</p>
            </div>
          </div>
          {/* More video items... */}
        </div>
      </main>
    </div>
  );
}