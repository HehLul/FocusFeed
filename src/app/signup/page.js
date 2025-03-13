"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import EnhancedLoadingScreen from "@/components/common/EnhancedLoadingScreen";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChannels, setSelectedChannels] = useState([]);

  // Retrieve selected channels from localStorage on component mount
  useEffect(() => {
    const channels = localStorage.getItem("selectedChannels");
    if (channels) {
      setSelectedChannels(JSON.parse(channels));
    } else {
      // If no channels found, redirect back to setup
      router.push("/setup");
    }
  }, [router]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign up the user with Supabase
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signupError) throw signupError;

      // Check if we have user data
      if (!data.user) {
        throw new Error("Failed to create account. Please try again.");
      }

      // Save user's selected channels to Supabase
      const { error: feedError } = await supabase.from("user_feeds").insert([
        {
          user_id: data.user.id,
          channels: selectedChannels.map((channel) => ({
            id: channel.id,
            title: channel.title,
            thumbnail: channel.thumbnailUrl,
          })),
        },
      ]);

      if (feedError) throw feedError;

      // Show loading screen before redirecting
      setTimeout(() => {
        // Clear localStorage after successful signup
        localStorage.removeItem("selectedChannels");

        // Redirect to feed page
        router.push("/feed");
      }, 2000);
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error.message || "An error occurred during signup");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {isLoading && <EnhancedLoadingScreen />}

      <div className="container mx-auto max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-center">
          <span className="text-green-400">One</span> Final Step
        </h1>

        <p className="text-gray-300 text-center mb-8">
          Your curated feed is almost ready! We just need your credentials to
          keep your personalized experience separate from others.
        </p>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-6 shadow-lg shadow-green-500/10">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Create a strong password"
                minLength="6"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-green-500/30"
              >
                Create Account & Launch Feed
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-green-400 hover:text-green-300">
                Log in
              </a>
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-center text-xs mt-8">
          We don't share your email with third parties or send spam. Your
          information is used only to save your feed preferences.
        </p>
      </div>
    </div>
  );
}
