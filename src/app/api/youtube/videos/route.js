// src/app/api/youtube/videos/route.js
import { NextResponse } from "next/server";

// Helper function to split an array into chunks
function chunkArray(array, chunkSize) {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      channelIds = [],
      videoIds = [],
      maxResults = 10,
      order = "date",
    } = body;

    console.log("API Request:", { channelIds, videoIds, maxResults, order });

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key is missing" },
        { status: 500 }
      );
    }

    let videos = [];
    const baseUrl = "https://www.googleapis.com/youtube/v3/videos";

    if (videoIds.length > 0) {
      // Fetch videos by specific video IDs
      console.log(`Fetching ${videoIds.length} videos by ID`);
      const videoIdChunks = chunkArray(videoIds, 50); // API allows up to 50 IDs per request
      for (const chunk of videoIdChunks) {
        const params = new URLSearchParams({
          key: apiKey,
          part: "snippet,statistics,contentDetails",
          id: chunk.join(","),
        });

        const response = await fetch(`${baseUrl}?${params}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          console.error(`YouTube API error: ${response.status}`);
          throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json();
        videos = videos.concat(data.items || []);
      }
    } else if (channelIds.length > 0) {
      // Fetch videos from specific channels
      console.log(`Fetching videos from ${channelIds.length} channels`);
      for (const channelId of channelIds) {
        const searchUrl = "https://www.googleapis.com/youtube/v3/search";
        const searchParams = new URLSearchParams({
          key: apiKey,
          part: "snippet",
          channelId,
          maxResults: maxResults.toString(),
          order,
          type: "video",
        });

        const searchResponse = await fetch(`${searchUrl}?${searchParams}`, {
          cache: "no-store",
        });

        if (!searchResponse.ok) {
          console.error(
            `Error fetching channel ${channelId}:`,
            searchResponse.status
          );
          continue;
        }

        const searchData = await searchResponse.json();
        const videoIdsFromChannels =
          searchData.items?.map((item) => item.id.videoId) || [];

        if (videoIdsFromChannels.length > 0) {
          const videoParams = new URLSearchParams({
            key: apiKey,
            part: "snippet,statistics,contentDetails",
            id: videoIdsFromChannels.join(","),
          });

          const videoDetailsResponse = await fetch(
            `${baseUrl}?${videoParams}`,
            {
              cache: "no-store",
            }
          );

          if (!videoDetailsResponse.ok) {
            console.error(
              "Error fetching video details:",
              videoDetailsResponse.status
            );
            continue;
          }

          const videoData = await videoDetailsResponse.json();
          videos = videos.concat(videoData.items || []);
        }
      }
    }

    // Sort videos if needed
    if (order === "viewCount") {
      videos.sort(
        (a, b) =>
          parseInt(b.statistics.viewCount || 0) -
          parseInt(a.statistics.viewCount || 0)
      );
    }

    // Transform the response to match your expected format
    const transformedVideos = videos.slice(0, maxResults).map((video) => {
      // Get the best available thumbnail URL
      const thumbnailUrl =
        video.snippet.thumbnails.maxres?.url ||
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.medium?.url ||
        video.snippet.thumbnails.default?.url;

      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        // Use both thumbnail and thumbnail_url for compatibility
        thumbnail: thumbnailUrl,
        thumbnail_url: thumbnailUrl,
        channelId: video.snippet.channelId,
        channel_title: video.snippet.channelTitle,
        channelTitle: video.snippet.channelTitle,
        viewCount: parseInt(video.statistics.viewCount || 0),
        view_count: parseInt(video.statistics.viewCount || 0),
        publishedAt: video.snippet.publishedAt,
        published_at: video.snippet.publishedAt,
        duration: video.contentDetails?.duration || null,
      };
    });

    console.log(`Returning ${transformedVideos.length} transformed videos`);
    return NextResponse.json({ videos: transformedVideos });
  } catch (error) {
    console.error("Error in YouTube API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
