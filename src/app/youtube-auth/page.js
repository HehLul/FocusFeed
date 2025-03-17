"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import EnhancedLoadingScreen from "@/components/common/EnhancedLoadingScreen";
import FeedHeader from "@/components/common/FeedHeader";

export default function YouTubeAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasYoutubeConnected, setHasYoutubeConnected] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check if user is authenticated and if they have already connected YouTube
  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if user is logged in with Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Not logged in, redirect to signup
          router.push("/signup");
          return;
        }

        // Check if user has connected YouTube account
        const { data: tokenData, error } = await supabase
          .from("user_youtube_tokens")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (tokenData) {
          setHasYoutubeConnected(true);

          // Check if they already have channels selected
          const { data: feedData } = await supabase
            .from("user_feeds")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (feedData && feedData.channels && feedData.channels.length > 0) {
            // They've already set up their feed, redirect to feed page
            router.push("/feed");
            return;
          } else {
            // They have connected YouTube but haven't selected channels
            router.push("/setup");
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const initiateYoutubeAuth = () => {
    try {
      setIsLoading(true);

      // Generate a random state string for security
      const state = Math.random().toString(36).substring(2, 15);
      // Store state in localStorage to verify when redirect comes back
      localStorage.setItem("youtube_oauth_state", state);

      // YouTube OAuth endpoint with required parameters
      const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/auth/youtube/callback`;
      const scope = "https://www.googleapis.com/auth/youtube.readonly";

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${state}`;

      // Redirect user to YouTube authorization page
      window.location.href = authUrl;
    } catch (error) {
      console.error("YouTube auth initiation error:", error);
      setAuthError("Failed to start YouTube authentication. Please try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <EnhancedLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <FeedHeader />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Connect Your <span className="text-green-400">YouTube</span> Account
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            FocusFeed works best when connected to your YouTube account. This
            helps us deliver a personalized experience while avoiding API rate
            limits.
          </p>
        </div>

        {authError && (
          <div className="bg-red-600 bg-opacity-20 border border-red-600 text-white p-4 rounded-lg mb-8 max-w-xl mx-auto">
            <p className="font-semibold mb-1">Connection Error</p>
            <p className="text-sm">{authError}</p>
          </div>
        )}

        <div className="bg-gray-900 rounded-xl p-8 max-w-xl mx-auto mb-12 border border-gray-800">
          <div className="flex items-start mb-8">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Privacy Focused</h3>
              <p className="text-gray-400">
                We only request read-only access to your YouTube data. We'll
                never post, edit, or delete anything on your behalf.
              </p>
            </div>
          </div>

          <div className="flex items-start mb-8">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Better Performance</h3>
              <p className="text-gray-400">
                By using your YouTube quota instead of our shared one, your feed
                will load faster and more reliably even as we grow.
              </p>
            </div>
          </div>

          <div className="flex items-start mb-12">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Personalized Experience
              </h3>
              <p className="text-gray-400">
                See your subscriptions and quickly select the channels that
                matter most to you for your focused feed.
              </p>
            </div>
          </div>

          <button
            onClick={initiateYoutubeAuth}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg
              className="w-6 h-6 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"></path>
            </svg>
            Connect YouTube Account
          </button>

          <p className="mt-6 text-sm text-gray-500 text-center">
            You can disconnect your YouTube account at any time from your
            account settings.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push("/setup")}
            className="text-gray-400 hover:text-green-400 transition-colors"
          >
            Skip for now (limited functionality)
          </button>
          <button
            onClick={async () => {
              const response = await fetch("/api/youtube/subscriptions");
              const data = await response.json();
              console.log("Subscription test:", data);
              alert(
                data.error
                  ? `Error: ${data.error}`
                  : `Success! Found ${data.items?.length || 0} subscriptions`
              );
            }}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Test YouTube Connection
          </button>
        </div>
      </div>
    </div>
  );
}
