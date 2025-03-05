'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import VideoCard from '@/components/feed/VideoCard';
import PlaylistHeader from '@/components/playlist/PlaylistHeader';
import LoadingFeedAnimation from '@/components/LoadingFeedAnimation';

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPlaylistData() {
      try {
        // First, fetch the playlist details
        const { data: playlistData, error: playlistError } = await supabase
          .from('playlists')
          .select('*')
          .eq('id', id)
          .single();

        if (playlistError) throw playlistError;
        if (!playlistData) throw new Error('Playlist not found');

        setPlaylist(playlistData);

        // Then fetch the videos in this playlist
        const { data: playlistVideos, error: videosError } = await supabase
          .from('playlist_videos')
          .select(`
            position,
            youtube_videos (
              id,
              title,
              description,
              thumbnail_url,
              channel_title,
              view_count,
              published_at
            )
          `)
          .eq('playlist_id', id)
          .order('position');

        if (videosError) throw videosError;

        // Transform the data structure
        const transformedVideos = playlistVideos
          .map(pv => ({
            ...pv.youtube_videos,
            position: pv.position
          }))
          .sort((a, b) => a.position - b.position);

        setVideos(transformedVideos);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchPlaylistData();
  }, [id]);

  if (loading) return <LoadingFeedAnimation />;
  if (error) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Error Loading Playlist</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    </div>
  );
  if (!playlist) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold">Playlist Not Found</h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <PlaylistHeader 
          playlist={playlist} 
          videoCount={videos.length} 
        />
        
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