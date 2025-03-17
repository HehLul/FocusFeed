// app/api/youtube/videos/route.js

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getValidYoutubeToken } from "@/utils/youtubeTokens";

/**
 * API endpoint to fetch videos from YouTube using user's OAuth token
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Required parameters
  const channelId = searchParams.get("channelId");

  // Optional parameters with defaults
  const maxResults = searchParams.get("maxResults") || "20";
  const sortBy = searchParams.get("sortBy") || "date"; // 'date', 'rating', 'viewCount', etc.
  const pageToken = searchParams.get("pageToken") || "";

  if (!channelId) {
    return NextResponse.json(
      { error: "Channel ID is required" },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get a valid token (this will refresh if necessary)
    const accessToken = await getValidYoutubeToken(session.user.id, supabase);

    // Construct search URL for channel videos
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.append("part", "snippet");
    searchUrl.searchParams.append("channelId", channelId);
    searchUrl.searchParams.append("maxResults", maxResults);
    searchUrl.searchParams.append("order", sortBy);
    searchUrl.searchParams.append("type", "video");

    if (pageToken) {
      searchUrl.searchParams.append("pageToken", pageToken);
    }

    // Fetch video search results
    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error("YouTube API error (search):", errorData);

      // If unauthorized, we might need to reconnect the YouTube account
      if (searchResponse.status === 401) {
        return NextResponse.json(
          {
            error: "YouTube authorization expired",
            needsReconnect: true,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to fetch videos from YouTube",
        },
        { status: searchResponse.status }
      );
    }

    const searchData = await searchResponse.json();

    // If no videos found, return early
    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({
        items: [],
        pageInfo: searchData.pageInfo,
        nextPageToken: searchData.nextPageToken,
        prevPageToken: searchData.prevPageToken,
      });
    }

    // Extract video IDs for getting additional details
    const videoIds = searchData.items
      .filter((item) => item.id && item.id.videoId)
      .map((item) => item.id.videoId);

    if (videoIds.length === 0) {
      return NextResponse.json({
        items: [],
        pageInfo: searchData.pageInfo,
        nextPageToken: searchData.nextPageToken,
        prevPageToken: searchData.prevPageToken,
      });
    }

    // Fetch additional video details (statistics, contentDetails, etc.)
    const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailsUrl.searchParams.append("part", "snippet,contentDetails,statistics");
    detailsUrl.searchParams.append("id", videoIds.join(","));

    const detailsResponse = await fetch(detailsUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let videoDetails = {};

    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();

      // Create a map of video details for easy lookup
      videoDetails = detailsData.items.reduce((acc, video) => {
        acc[video.id] = video;
        return acc;
      }, {});
    } else {
      console.error(
        "Error fetching video details:",
        await detailsResponse.json()
      );
      // Continue with basic info if details fetch fails
    }

    // Combine search results with video details
    const enhancedVideos = searchData.items.map((item) => {
      const videoId = item.id.videoId;
      const details = videoDetails[videoId];

      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: getBestThumbnail(item.snippet.thumbnails),
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        // Add details if available
        duration: details?.contentDetails?.duration,
        viewCount: details?.statistics?.viewCount,
        likeCount: details?.statistics?.likeCount,
        commentCount: details?.statistics?.commentCount,
      };
    });

    // Return combined data
    return NextResponse.json({
      items: enhancedVideos,
      pageInfo: searchData.pageInfo,
      nextPageToken: searchData.nextPageToken,
      prevPageToken: searchData.prevPageToken,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);

    // Check if this is a token-related error that requires reconnection
    if (
      error.message?.includes("YouTube account not connected") ||
      error.message?.includes("Failed to refresh token")
    ) {
      return NextResponse.json(
        {
          error: error.message,
          needsReconnect: true,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to fetch videos",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get the best quality thumbnail
 */
function getBestThumbnail(thumbnails) {
  if (!thumbnails) return null;

  // Preference: maxres -> high -> medium -> standard -> default
  if (thumbnails.maxres) return thumbnails.maxres.url;
  if (thumbnails.high) return thumbnails.high.url;
  if (thumbnails.medium) return thumbnails.medium.url;
  if (thumbnails.standard) return thumbnails.standard.url;
  if (thumbnails.default) return thumbnails.default.url;

  // Return the first available thumbnail if none of the preferred ones exist
  const thumbKeys = Object.keys(thumbnails);
  if (thumbKeys.length > 0 && thumbnails[thumbKeys[0]].url) {
    return thumbnails[thumbKeys[0]].url;
  }

  return null;
}
