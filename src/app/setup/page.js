"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignupModal from "../../components/SignupModal";
import LoadingFeedAnimation from "../../components/LoadingFeedAnimation";
import { supabase } from "../../utils/supabase";

// Category data
const categories = [
  { id: "tech", title: "Technology", image: "/categories/tech.jpg" },
  {
    id: "fitness",
    title: "Fitness & Health",
    image: "/categories/fitness.jpg",
  },
  {
    id: "philosophy",
    title: "Philosophy",
    image: "/categories/philosophy.jpg",
  },
  {
    id: "productivity",
    title: "Productivity",
    image: "/categories/productivity.jpg",
  },
  { id: "coding", title: "Programming", image: "/categories/coding.jpg" },
  {
    id: "psychology",
    title: "Psychology",
    image: "/categories/psychology.jpg",
  },
  { id: "education", title: "Education", image: "/categories/education.jpg" },
  {
    id: "selfhelp",
    title: "Self Improvement",
    image: "/categories/selfhelp.jpg",
  },
];

export default function ChannelSetup() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [isCurating, setIsCurating] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [view, setView] = useState("default"); // 'default' or 'category'

  // Improved thumbnail selection function
  const getChannelThumbnail = (channel) => {
    const defaultThumbnail = "/default-channel-thumbnail.png";
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
      console.error("Thumbnail selection error:", error);
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
      const response = await fetch(
        `/api/youtube/search-channels?q=${encodeURIComponent(searchTerm)}${
          activeCategory ? `&category=${activeCategory}` : ""
        }`
      );
      const data = await response.json();

      // Filter only channel results
      const channelResults = data.items.filter(
        (item) => item.id.kind === "youtube#channel"
      );
      // Process channels
      const processedChannels = channelResults.map((channel, index) => ({
        id: channel.id.channelId,
        uniqueKey: `${channel.id.channelId}-${index}`,
        title: channel.snippet.channelTitle,
        description: channel.snippet.description,
        thumbnailUrl: getChannelThumbnail(channel),
        rawChannel: channel,
      }));
      setSearchResults(processedChannels);
    } catch (error) {
      console.error("Error searching YouTube channels:", error);
      setError(error.message || "Failed to search channels");
    } finally {
      setIsLoading(false);
    }
  };

  const searchByCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setView("category");
    setSearchTerm(categories.find((cat) => cat.id === categoryId).title);
    // This will trigger the useEffect to search
  };

  const resetSearch = () => {
    setActiveCategory(null);
    setView("default");
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeChannel = (channelId) => {
    setSelectedChannels((prev) =>
      prev.filter((channel) => channel.id !== channelId)
    );
  };

  const addChannel = (channel) => {
    // Prevent duplicate channels and limit to 10
    if (
      !selectedChannels.some((c) => c.id === channel.id) &&
      selectedChannels.length < 10
    ) {
      setSelectedChannels((prev) => [...prev, channel]);
      setSearchTerm("");
      setSearchResults([]);
      setView("default");
      setActiveCategory(null);
    }
  };

  const handleSubmit = async () => {
    if (selectedChannels.length < 3) {
      alert("Please select at least 3 channels");
      return;
    }

    // Show curating animation for 4 seconds
    setIsCurating(true);

    // After 4 seconds, show signup modal
    setTimeout(() => {
      setIsCurating(false);
      setShowSignup(true);
    }, 4000);
  };

  const handleSignupSuccess = async (user) => {
    try {
      console.log("Signup success with user ID:", user.id);

      // Verify session before proceeding
      const { data: sessionCheck } = await supabase.auth.getSession();

      if (!sessionCheck.session) {
        console.error("No active session found after signup success");
        throw new Error("Authentication failed. Please try again.");
      }

      console.log("Active session confirmed, user is logged in");

      // Save user's selected channels to Supabase
      const { error } = await supabase.from("user_feeds").insert([
        {
          user_id: user.id,
          channels: selectedChannels.map((channel) => ({
            id: channel.id,
            title: channel.title,
            thumbnail: channel.thumbnailUrl,
          })),
        },
      ]);

      if (error) {
        console.error("Error saving feed:", error);
        throw error;
      }

      // After successful feed save
      console.log("Feed saved successfully");

      // Hide signup modal and show feed creation animation
      setShowSignup(false);
      setIsCurating(true);

      // Wait a moment to ensure everything is saved and session is established
      setTimeout(async () => {
        try {
          // Double-check session before redirecting
          const { data: sessionCheck } = await supabase.auth.getSession();
          console.log(
            "Final session check before redirect:",
            sessionCheck.session ? "Session active" : "No session"
          );

          if (sessionCheck.session) {
            // We have a confirmed session, safe to redirect
            console.log("Redirecting to feed page with active session");
            router.push("/feed");
          } else {
            // Still no session, show an error
            console.error("No active session before redirect");
            setError("Authentication issue. Please try again.");
            setIsCurating(false);
          }
        } catch (error) {
          console.error("Error during redirect:", error);
          setIsCurating(false);
          setError("Failed to navigate to your feed. Please try again.");
        }
      }, 2000);
    } catch (error) {
      console.error("Error in signup process:", error);
      setError(error.message || "Failed to create feed. Please try again.");
      setIsCurating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-4 text-center">
          <span className="text-green-400">Curate</span> Your YouTube Feed
        </h1>
        <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
          Select 3-10 channels that truly matter to you. Build a feed that fuels
          your mind, not your addiction.
        </p>

        {/* Error Display */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => resetSearch()}
            className={`px-4 py-2 rounded-l-lg ${
              view === "default"
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Search Channels
          </button>
          <button
            onClick={() => setView("category")}
            className={`px-4 py-2 rounded-r-lg ${
              view === "category"
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Browse Categories
          </button>
        </div>

        {view === "default" ? (
          /* Channel Search */
          <div className="mb-8 relative">
            <div className="flex items-center bg-gray-900 rounded-lg p-2 focus-within:ring-2 focus-within:ring-green-500">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search YouTube Channels"
                className="w-full p-2 bg-transparent text-white focus:outline-none"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-gray-900 rounded-lg max-h-60 overflow-y-auto">
                {searchResults.map((channel) => (
                  <div
                    key={channel.uniqueKey}
                    className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700 last:border-b-0"
                    onClick={() => addChannel(channel)}
                  >
                    <img
                      src={channel.thumbnailUrl}
                      alt={channel.title}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                      onError={(e) => {
                        e.target.src = "/default-channel-thumbnail.png";
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
        ) : (
          /* Categories Section */
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Browse by <span className="text-green-400">Category</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => searchByCategory(category.id)}
                  className="relative h-40 rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${category.image})`,
                      filter: "brightness(0.4)",
                    }}
                  ></div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-80"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-xl font-bold text-white text-center px-4">
                      {category.title}
                    </h3>
                  </div>

                  {activeCategory === category.id && (
                    <div className="absolute top-0 right-0 m-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Channels */}
        <div className="mb-8 bg-gray-900 p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="text-green-400 mr-2">Selected Channels</span>
            <span className="bg-green-500 text-white text-sm px-2 py-1 rounded-full">
              {selectedChannels.length}/10
            </span>
          </h2>

          {selectedChannels.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">
                Start searching or browse categories to add at least 3 channels
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center border border-gray-700 hover:border-green-500 transition-colors"
                >
                  <img
                    src={channel.thumbnailUrl}
                    alt={channel.title}
                    className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-green-500"
                    onError={(e) => {
                      e.target.src = "/default-channel-thumbnail.png";
                    }}
                  />
                  <div className="flex-grow mr-2">
                    <p className="font-semibold truncate">{channel.title}</p>
                  </div>
                  <button
                    onClick={() => removeChannel(channel.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${channel.title}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleSubmit}
            disabled={selectedChannels.length < 3 || isLoading}
            className={`
              px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition-all
              ${
                selectedChannels.length >= 3 && !isLoading
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/40"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? "Creating Feed..." : `Create My Focused Feed`}
          </button>

          <p className="mt-4 text-gray-400 text-sm">
            {selectedChannels.length < 3
              ? `Add ${3 - selectedChannels.length} more channel${
                  selectedChannels.length === 2 ? "" : "s"
                } to continue`
              : "Click to create your personalized feed and take back control"}
          </p>
        </div>
      </div>

      {/* Curating Feed Loading Animation */}
      {isCurating && <LoadingFeedAnimation />}

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSuccess={handleSignupSuccess}
      />
    </div>
  );
}
