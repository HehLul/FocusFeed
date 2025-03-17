// utils/youtubeTokens.js

/**
 * Utility functions for managing YouTube OAuth tokens
 */

/**
 * Gets a valid YouTube access token for a user, refreshing if necessary
 * @param {string} userId - The Supabase user ID
 * @param {object} supabaseClient - Supabase client instance
 * @returns {Promise<string>} - A valid access token
 */
export async function getValidYoutubeToken(userId, supabaseClient) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Get the user's token data
  const { data: tokenData, error: tokenError } = await supabaseClient
    .from("user_youtube_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (tokenError || !tokenData) {
    throw new Error("YouTube account not connected");
  }

  // Check if token is expired
  const now = new Date();
  const tokenExpiry = new Date(tokenData.expires_at);

  // If token is still valid, return it
  if (now < tokenExpiry) {
    return tokenData.access_token;
  }

  // Token is expired, refresh it
  try {
    if (!tokenData.refresh_token) {
      throw new Error("No refresh token available");
    }

    const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        refresh_token: tokenData.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const refreshData = await refreshResponse.json();

    if (!refreshResponse.ok) {
      console.error("Error refreshing token:", refreshData);
      throw new Error("Failed to refresh token");
    }

    // Calculate new expiry
    const newExpiry = new Date();
    newExpiry.setSeconds(newExpiry.getSeconds() + refreshData.expires_in);

    // Update token in database
    const { error: updateError } = await supabaseClient
      .from("user_youtube_tokens")
      .update({
        access_token: refreshData.access_token,
        expires_at: newExpiry.toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating token:", updateError);
      throw new Error("Failed to update token");
    }

    return refreshData.access_token;
  } catch (error) {
    console.error("Error in token refresh process:", error);
    throw new Error(`Token refresh process failed: ${error.message}`);
  }
}

/**
 * Checks if a user has connected their YouTube account
 * @param {string} userId - The Supabase user ID
 * @param {object} supabaseClient - Supabase client instance
 * @returns {Promise<boolean>} - Whether the user has connected YouTube
 */
export async function hasYoutubeConnected(userId, supabaseClient) {
  if (!userId) return false;

  try {
    const { data, error } = await supabaseClient
      .from("user_youtube_tokens")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error("Error checking YouTube connection:", error);
    return false;
  }
}

/**
 * Removes a user's YouTube connection by deleting their tokens
 * @param {string} userId - The Supabase user ID
 * @param {object} supabaseClient - Supabase client instance
 * @returns {Promise<boolean>} - Whether the disconnection was successful
 */
export async function disconnectYoutubeAccount(userId, supabaseClient) {
  if (!userId) return false;

  try {
    const { error } = await supabaseClient
      .from("user_youtube_tokens")
      .delete()
      .eq("user_id", userId);

    return !error;
  } catch (error) {
    console.error("Error disconnecting YouTube account:", error);
    return false;
  }
}
