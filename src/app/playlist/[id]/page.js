"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import VideoCard from "@/components/feed/VideoCard";
import PlaylistHeader from "@/components/playlist/PlaylistHeader";
import LoadingFeedAnimation from "@/components/LoadingFeedAnimation";

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPlaylistData() {
      try {
        // Fetch playlist details with video data from Supabase
        const { data: playlistData, error: playlistError } = await supabase
          .from("playlists")
          .select(
            `
            *,
            playlist_videos (
              position,
              video_id,
              youtube_videos (*)
            )
          `
          )
          .eq("id", id)
          .single();

        console.log(
          "Raw playlist data:",
          JSON.stringify(playlistData, null, 2)
        );

        if (playlistError) throw playlistError;
        if (!playlistData) throw new Error("Playlist not found");

        setPlaylist(playlistData);

        const videoIds = playlistData.playlist_videos.map((pv) => pv.video_id);
        console.log("Video IDs:", videoIds);

        // Fetch fresh data from YouTube API
        // Update this part in the fetchPlaylistData function
        const response = await fetch("/api/youtube/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoIds: videoIds, // Changed from channelIds to videoIds
            maxResults: videoIds.length,
          }),
        });

        const youtubeData = await response.json();
        console.log("YouTube API response:", youtubeData);

        // Update this part in your playlist page
        const transformedVideos = playlistData.playlist_videos
          .map((pv) => {
            const freshVideo = freshVideos.find((v) => v.id === pv.video_id);
            if (freshVideo) {
              return {
                id: freshVideo.id,
                title: freshVideo.title,
                description: freshVideo.description,
                thumbnail_url: freshVideo.thumbnail, // Add both for compatibility
                thumbnail: freshVideo.thumbnail, // Add both for compatibility
                channel_title: freshVideo.channelTitle,
                view_count: freshVideo.viewCount,
                published_at: freshVideo.publishedAt,
                duration: freshVideo.duration,
                position: pv.position,
              };
            }
            return {
              id: pv.youtube_videos?.id,
              title: pv.youtube_videos?.title || "Unavailable video",
              description: pv.youtube_videos?.description,
              thumbnail_url: pv.youtube_videos?.thumbnail_url,
              thumbnail: pv.youtube_videos?.thumbnail_url,
              channel_title: pv.youtube_videos?.channel_title,
              view_count: pv.youtube_videos?.view_count,
              published_at: pv.youtube_videos?.published_at,
              position: pv.position,
            };
          })
          .sort((a, b) => a.position - b.position);

        console.log(
          "Final transformed videos:",
          JSON.stringify(transformedVideos, null, 2)
        );

        setVideos(transformedVideos);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching playlist:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchPlaylistData();
  }, [id]);

  if (loading) return <LoadingFeedAnimation />;
  if (error)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Error Loading Playlist</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  if (!playlist)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Playlist Not Found</h2>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <PlaylistHeader playlist={playlist} videoCount={videos.length} />

        <div className="mt-8 space-y-6">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index + 1}
              showPlaylistNumber
            />
          ))}

          {videos.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No videos in this playlist yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
