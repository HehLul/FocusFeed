// app/api/youtube/videos/route.js
import { NextResponse } from 'next/server';

// Helper to format duration from YouTube's ISO 8601 format to a readable format
function formatDuration(isoDuration) {
  // If duration is missing, return a default value
  if (!isoDuration) return "0:00";
  
  // Parse the ISO 8601 duration format (e.g., PT1H23M45S)
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return "0:00";
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  // Format the duration based on length
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export async function POST(request) {
  try {
    const { channelIds, order = 'date', maxResults = 20 } = await request.json();
    
    if (!channelIds || !Array.isArray(channelIds) || channelIds.length === 0) {
      return NextResponse.json(
        { error: 'Channel IDs must be provided as an array' },
        { status: 400 }
      );
    }
    
    // Get YouTube API key from environment variables
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.error('YouTube API key is missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Combine videos from all channels, up to a total of maxResults
    let allVideos = [];
    
    // Limit the number of channels to process to avoid excessive API calls
    const channelsToProcess = channelIds.slice(0, 10);
    
    // We'll fetch videos from each channel in parallel
    const videoPromises = channelsToProcess.map(async (channelId) => {
      try {
        // 1. Get uploads playlist ID for the channel
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
          { cache: 'no-store' }
        );
        
        if (!channelResponse.ok) {
          throw new Error(`Failed to fetch channel data: ${channelResponse.status}`);
        }
        
        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
          console.warn(`No channel found for ID: ${channelId}`);
          return [];
        }
        
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        
        // 2. Get videos from the uploads playlist
        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${uploadsPlaylistId}&key=${apiKey}`,
          { cache: 'no-store' }
        );
        
        if (!playlistResponse.ok) {
          throw new Error(`Failed to fetch playlist items: ${playlistResponse.status}`);
        }
        
        const playlistData = await playlistResponse.json();
        
        if (!playlistData.items || playlistData.items.length === 0) {
          console.warn(`No videos found for channel: ${channelId}`);
          return [];
        }
        
        // Extract video IDs for further details
        const videoIds = playlistData.items
          .map(item => item.snippet.resourceId.videoId)
          .join(',');
        
        // 3. Get additional video details
        const videoDetailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`,
          { cache: 'no-store' }
        );
        
        if (!videoDetailsResponse.ok) {
          throw new Error(`Failed to fetch video details: ${videoDetailsResponse.status}`);
        }
        
        const videoDetailsData = await videoDetailsResponse.json();
        
        if (!videoDetailsData.items || videoDetailsData.items.length === 0) {
          console.warn(`No video details found for IDs: ${videoIds}`);
          return [];
        }
        
        // Process and format the video data
        return videoDetailsData.items.map(video => ({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          publishedAt: video.snippet.publishedAt,
          thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          duration: formatDuration(video.contentDetails.duration),
          viewCount: parseInt(video.statistics.viewCount || 0),
          likeCount: parseInt(video.statistics.likeCount || 0),
          commentCount: parseInt(video.statistics.commentCount || 0)
        }));
      } catch (error) {
        console.error(`Error fetching videos for channel ${channelId}:`, error);
        return [];
      }
    });
    
    // Wait for all promises to resolve
    const videosArrays = await Promise.all(videoPromises);
    
    // Flatten the array of arrays into a single array of videos
    allVideos = videosArrays.flat();
    
    // Sort the videos based on the requested order
    if (order === 'date') {
      allVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (order === 'viewCount') {
      allVideos.sort((a, b) => b.viewCount - a.viewCount);
    }
    
    // Limit to maxResults
    allVideos = allVideos.slice(0, maxResults);
    
    return NextResponse.json({ videos: allVideos });
    
  } catch (error) {
    console.error('Error in /api/youtube/videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}