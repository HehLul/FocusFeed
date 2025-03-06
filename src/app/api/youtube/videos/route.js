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
      const videoIdChunks = chunkArray(videoIds, 50); // API allows up to 50 IDs per request
      for (const chunk of videoIdChunks) {
        const params = new URLSearchParams({
          key: apiKey,
          part: "snippet,statistics",
          id: chunk.join(","),
        });

        const response = await fetch(`${baseUrl}?${params}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json();
        videos = videos.concat(data.items || []);
      }
    } else if (channelIds.length > 0) {
      // Fetch videos from specific channels
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
            part: "snippet,statistics",
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
    const transformedVideos = videos.slice(0, maxResults).map((video) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail:
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.default?.url,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      viewCount: parseInt(video.statistics.viewCount || 0),
      publishedAt: video.snippet.publishedAt,
    }));

    return NextResponse.json({ videos: transformedVideos });
  } catch (error) {
    console.error("Error in YouTube API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
