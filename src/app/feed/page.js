// app/feed/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import LoadingFeedAnimation from "@/components/LoadingFeedAnimation";

// Import components
import FeedHeader from "@/components/common/FeedHeader";
import DebugSession from "@/components/common/DebugSession";
import CollectionSection from "@/components/feed/CollectionSection";
import FeedTabs from "@/components/feed/FeedTabs";
import VideoSection from "@/components/feed/VideoSection";
import CreateCollectionModal from "@/components/feed/CreateCollectionModal";

// Import helper for featured collections
import { getFeaturedCollections } from "@/utils/featuredCollections";

export default function FeedPage() {
  const [user, setUser] = useState(null);
  const [userFeed, setUserFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState("feed"); // "feed" or "collections"
  const [activeFeedTab, setActiveFeedTab] = useState("latest"); // "latest" or "top"
  const [videos, setVideos] = useState({ latest: [], top: [] });
  const [videoLoading, setVideoLoading] = useState(false);

  // Collections state
  const [collections, setCollections] = useState([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] =
    useState(false);

  const router = useRouter();

  useEffect(() => {
    console.log("Feed page mounted - checking authentication");
    let isMounted = true;

    // Check if user is authenticated and fetch their feed
    async function fetchUserAndFeed() {
      try {
        console.log("Fetching session data...");

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log(
          "Session result:",
          session ? "Active session found" : "No session found"
        );

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No session, redirecting to home");
          setTimeout(() => {
            if (isMounted) router.push("/");
          }, 100);
          return;
        }
        console.log("User authenticated:", session.user.email);
        if (isMounted) setUser(session.user);

        // Fetch the user's feed
        console.log("Fetching user feed for ID:", session.user.id);
        const { data: feedData, error: feedError } = await supabase
          .from("user_feeds")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (feedError) {
          console.error("Feed fetch error:", feedError);
          throw feedError;
        }

        console.log("Feed data retrieved:", feedData ? "Success" : "No data");
        if (isMounted) {
          setUserFeed(feedData);
          setLoading(false);

          // Load collections and videos
          loadCollections();
          if (feedData?.channels && feedData.channels.length > 0) {
            fetchVideos();
          }
        }
      } catch (error) {
        console.error("Error in feed page:", error);
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

  // Helper function to generate a proxied thumbnail URL
  const getProxiedThumbnailUrl = (videoId) => {
    if (!videoId) return "/default-thumbnail.png";
    return `/api/thumbnail/${videoId}`;
  };

  // Load user collections and add featured collections
  const loadCollections = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get the featured collections
      const featuredCollections = getFeaturedCollections();

      // Fetch user collections (from playlists table)
      const { data: collectionData, error: collectionError } = await supabase
        .from("playlists")
        .select(
          `
          id,
          title,
          description,
          purpose,
          purpose_description,
          created_at,
          playlist_videos (
            position,
            video_id,
            video:youtube_videos (
              id,
              title,
              thumbnail_url
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (collectionError) throw collectionError;

      // Transform the data
      const transformedCollections = collectionData.map((collection) => {
        // Sort collection videos by position
        const sortedVideos = [...collection.playlist_videos].sort(
          (a, b) => a.position - b.position
        );

        // Generate direct YouTube thumbnail URLs
        const thumbnails = sortedVideos
          .map((pv) => {
            // If we have a video ID, generate a direct YouTube thumbnail URL
            if (pv.video_id) {
              return `https://i.ytimg.com/vi/${pv.video_id}/mqdefault.jpg`;
            }
            return null;
          })
          .filter(Boolean) // Remove any null/undefined values
          .slice(0, 4);

        console.log(
          `Collection "${collection.title}" has ${thumbnails.length} direct thumbnails:`,
          thumbnails
        );

        return {
          id: collection.id,
          name: collection.title,
          description: collection.description,
          purpose: collection.purpose || null,
          purposeDescription: collection.purpose_description || null,
          videoCount: collection.playlist_videos.length,
          thumbnails: thumbnails,
          featured: false, // User's own collections
        };
      });

      // Combine with featured collections
      const allCollections = [
        ...featuredCollections, // Add featured collections first
        ...transformedCollections, // Then user collections
      ];

      setCollections(allCollections);
    } catch (error) {
      console.error("Error loading collections:", error);
    }
  };

  const fetchVideos = async () => {
    if (!userFeed?.channels || userFeed.channels.length === 0) return;

    setVideoLoading(true);

    try {
      // Prepare channel IDs for API call
      const channelIds = userFeed.channels.map((channel) => channel.id);

      // Fetch latest videos with a timeout to prevent hanging requests
      const fetchLatestVideos = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await fetch("/api/youtube/videos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              channelIds,
              order: "date", // Order by date for latest videos
              maxResults: 50, // Fetch more videos to get a good mix across channels
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch latest videos");
          }

          const data = await response.json();

          // Ensure each video has a proper thumbnail URL and parsed date
          if (data.videos && data.videos.length > 0) {
            data.videos = data.videos.map((video) => {
              // Generate YouTube thumbnail URL if needed
              if (!video.thumbnail) {
                video.thumbnail = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
              }

              // Parse the publication date for sorting
              video.parsedDate = new Date(
                video.publishedAt || video.published_at || 0
              );

              return video;
            });

            // Sort all videos by date, regardless of channel
            data.videos.sort((a, b) => b.parsedDate - a.parsedDate);
          }

          return data;
        } catch (error) {
          clearTimeout(timeoutId);
          console.error("Error fetching latest videos:", error);
          throw error;
        }
      };

      // Fetch top videos with a timeout
      const fetchTopVideos = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await fetch("/api/youtube/videos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              channelIds,
              order: "viewCount", // Order by view count for top videos
              maxResults: 50, // Fetch more to get a good mix
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch top videos");
          }

          const data = await response.json();

          // Ensure each video has a proper thumbnail URL
          if (data.videos && data.videos.length > 0) {
            data.videos = data.videos.map((video) => {
              // Generate YouTube thumbnail URL if needed
              if (!video.thumbnail) {
                video.thumbnail = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
              }
              return video;
            });

            // Sort by view count in descending order
            data.videos.sort((a, b) => {
              const viewCountA = parseInt(a.viewCount || a.view_count || 0);
              const viewCountB = parseInt(b.viewCount || b.view_count || 0);
              return viewCountB - viewCountA;
            });
          }

          return data;
        } catch (error) {
          clearTimeout(timeoutId);
          console.error("Error fetching top videos:", error);
          throw error;
        }
      };

      // Execute both fetch requests in parallel
      const [latestData, topData] = await Promise.allSettled([
        fetchLatestVideos(),
        fetchTopVideos(),
      ]);

      // Process results, handling any failures
      setVideos({
        latest:
          latestData.status === "fulfilled"
            ? latestData.value.videos || []
            : [],
        top: topData.status === "fulfilled" ? topData.value.videos || [] : [],
      });

      // Check if we had any failures
      if (latestData.status === "rejected" && topData.status === "rejected") {
        console.error(
          "Both video fetches failed:",
          latestData.reason,
          topData.reason
        );
        throw new Error(
          "Failed to fetch videos. This might be due to YouTube API rate limiting."
        );
      }
    } catch (error) {
      console.error("Error in fetchVideos:", error);
      // We don't show an error message on the UI as the empty state will handle this
    } finally {
      setVideoLoading(false);
    }
  };

  const handleCreateCollection = async (collectionData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First, create the collection
      const { data: collection, error: collectionError } = await supabase
        .from("playlists") // Keep using the playlists table for now
        .insert({
          user_id: user.id,
          title: collectionData.name,
          description: collectionData.description,
          purpose: collectionData.purpose || null,
          purpose_description: collectionData.purposeDescription || null,
        })
        .select()
        .single();

      if (collectionError) throw collectionError;

      // Arrays to store video data
      const videoIds = [];
      const videoThumbnails = [];

      // If videos were provided, add them to the collection
      if (collectionData.videoUrls && collectionData.videoUrls.length > 0) {
        // Extract all valid video IDs
        for (let i = 0; i < collectionData.videoUrls.length; i++) {
          const videoUrl = collectionData.videoUrls[i];
          const videoId = extractVideoId(videoUrl);

          if (videoId) {
            videoIds.push(videoId);
            videoThumbnails.push(getProxiedThumbnailUrl(videoId));

            // Add video to database
            const { error: videoError } = await supabase
              .from("youtube_videos")
              .upsert(
                {
                  id: videoId,
                  title: `Video ${i + 1}`,
                  // Store the video ID rather than the full URL
                  thumbnail_url: videoId,
                  channel_title: "Loading...",
                  description: "",
                  view_count: 0,
                  published_at: new Date().toISOString(),
                },
                {
                  onConflict: "id",
                }
              );

            if (videoError) console.error("Error upserting video:", videoError);

            // Add to playlist_videos with position
            const { error: playlistVideoError } = await supabase
              .from("playlist_videos")
              .insert({
                playlist_id: collection.id,
                video_id: videoId,
                position: i,
              });

            if (playlistVideoError)
              console.error(
                "Error adding video to collection:",
                playlistVideoError
              );
          }
        }

        // Fetch video details to update titles and other metadata
        if (videoIds.length > 0) {
          try {
            const response = await fetch("/api/youtube/videos", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                videoIds: videoIds,
                maxResults: videoIds.length,
              }),
            });

            if (response.ok) {
              const { videos } = await response.json();

              if (videos && videos.length > 0) {
                // Update videos with proper titles and metadata
                for (const video of videos) {
                  const { error: updateError } = await supabase
                    .from("youtube_videos")
                    .update({
                      title: video.title || "Unknown Video",
                      // Keep using just the video ID for thumbnail
                      channel_title: video.channelTitle || "Unknown Channel",
                      description: video.description || "",
                      published_at:
                        video.publishedAt || new Date().toISOString(),
                      view_count: video.viewCount || 0,
                    })
                    .eq("id", video.id);

                  if (updateError) {
                    console.error("Error updating video data:", updateError);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error fetching video data:", error);
          }
        }
      }

      // Add the new collection to state with thumbnails
      const newCollection = {
        id: collection.id,
        name: collection.title,
        description: collection.description,
        purpose: collectionData.purpose || null,
        purposeDescription: collectionData.purposeDescription || null,
        videoCount: videoIds.length,
        thumbnails: videoThumbnails.slice(0, 4),
        featured: false,
      };

      setCollections((prev) => [
        newCollection,
        ...prev.filter((c) => c.featured),
      ]);
      setShowCreateCollectionModal(false);

      // Switch to collections tab after creating a new collection
      setActiveMainTab("collections");

      return true;
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection. Please try again.");
      return false;
    }
  };

  // Enhanced video ID extraction from URL
  const extractVideoId = (url) => {
    try {
      // Handle different URL formats
      const urlObj = new URL(url);
      let videoId = null;

      if (urlObj.hostname.includes("youtube.com")) {
        videoId = urlObj.searchParams.get("v");
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.substring(1);
      }

      // Validate video ID format (typically 11 characters)
      if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }

      console.error("Invalid YouTube video ID from URL:", url);
      return null;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return null;
    }
  };

  const handleCollectionClick = (collectionId) => {
    // For featured collections, we may want to handle differently
    const collection = collections.find((c) => c.id === collectionId);

    if (collection && collection.featured) {
      // For featured collections, we might want to copy them to the user's collections first
      // Or we could just display the videos directly
      console.log("Clicked featured collection:", collection);

      // For now, we'll just go to the collection view (to be implemented)
      router.push(`/collection/${collectionId}`);
    } else {
      // For user collections, use the existing playlist route (to be renamed)
      router.push(`/playlist/${collectionId}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
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
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Error Loading Your Feed
        </h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 transition-colors text-white rounded"
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
      <FeedHeader userEmail={user?.email} onSignOut={handleSignOut} />

      {/* Feed content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">
          Your <span className="text-green-400">Focused Feed</span>
        </h2>

        {/* Main Tabs (Collections / Feed) */}
        <div className="border-b border-gray-800 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveMainTab("feed")}
              className={`pb-4 px-1 ${
                activeMainTab === "feed"
                  ? "border-b-2 border-green-500 text-green-400 font-medium"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveMainTab("collections")}
              className={`pb-4 px-1 ${
                activeMainTab === "collections"
                  ? "border-b-2 border-green-500 text-green-400 font-medium"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Collections
            </button>
          </div>
        </div>

        {/* Conditional content based on active tab */}
        {activeMainTab === "collections" ? (
          /* Collections Tab Content */
          <CollectionSection
            collections={collections}
            onCreateCollection={() => setShowCreateCollectionModal(true)}
            onCollectionClick={handleCollectionClick}
          />
        ) : (
          /* Feed Tab Content */
          <>
            {/* Tabs for Latest and Top videos */}
            <div className="mb-6">
              <FeedTabs
                activeTab={activeFeedTab}
                onTabChange={(tab) => setActiveFeedTab(tab)}
              />
            </div>

            {/* Video Display */}
            <VideoSection
              title={
                activeFeedTab === "latest" ? "Latest Videos" : "Top Videos"
              }
              videos={videos[activeFeedTab]}
              isLoading={videoLoading}
              onRefresh={fetchVideos}
            />
          </>
        )}

        {/* Debug section - remove in production */}
        {process.env.NODE_ENV !== "production" && <DebugSession />}
      </main>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateCollectionModal}
        onClose={() => setShowCreateCollectionModal(false)}
        onSubmit={handleCreateCollection}
      />
    </div>
  );
}
