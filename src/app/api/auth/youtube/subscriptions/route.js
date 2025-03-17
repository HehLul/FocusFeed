// app/api/youtube/subscriptions/route.js

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getValidYoutubeToken } from "@/utils/youtubeTokens";

/**
 * API endpoint to fetch user's YouTube subscriptions
 */
export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Optional pagination parameters
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get("pageToken") || "";
  const maxResults = searchParams.get("maxResults") || "50";

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

    // Fetch user's subscriptions using their token
    const url = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
    url.searchParams.append("part", "snippet,contentDetails");
    url.searchParams.append("mine", "true");
    url.searchParams.append("maxResults", maxResults);

    if (pageToken) {
      url.searchParams.append("pageToken", pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error:", errorData);

      // If unauthorized, we might need to reconnect the YouTube account
      if (response.status === 401) {
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
          error: "Failed to fetch subscriptions from YouTube",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Process the subscription data into a more usable format
    const processedData = {
      ...data,
      items: data.items.map((item) => ({
        id: item.snippet.resourceId.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: getChannelThumbnail(item.snippet.thumbnails),
        publishedAt: item.snippet.publishedAt,
        // Store the raw item for any additional needs
        rawData: item,
      })),
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);

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
      { error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get the best available thumbnail
 */
function getChannelThumbnail(thumbnails) {
  if (!thumbnails) return null;

  // Preference: high -> medium -> default
  if (thumbnails.high) return thumbnails.high.url;
  if (thumbnails.medium) return thumbnails.medium.url;
  if (thumbnails.default) return thumbnails.default.url;

  // Return the first available thumbnail if none of the preferred ones exist
  const thumbKeys = Object.keys(thumbnails);
  if (thumbKeys.length > 0 && thumbnails[thumbKeys[0]].url) {
    return thumbnails[thumbKeys[0]].url;
  }

  return null;
}
