// utils/featuredCollections.js

export const getFeaturedCollections = () => {
  return [
    {
      id: "fc-motivation",
      name: "Motivation Boost",
      description: "For when you need inspiration to take action",
      purposeDescription:
        "When you need a boost of energy or to rekindle your drive",
      purpose: "motivation",
      videoCount: 8,
      thumbnails: [
        "https://i.ytimg.com/vi/IdTMDpizis8/mqdefault.jpg",
        "https://i.ytimg.com/vi/V80-gPkpH6M/mqdefault.jpg",
        "https://i.ytimg.com/vi/PE0twVEGjDA/mqdefault.jpg",
        "https://i.ytimg.com/vi/p3wU7wRITtk/mqdefault.jpg",
      ],
      videos: [
        "IdTMDpizis8",
        "V80-gPkpH6M",
        "PE0twVEGjDA",
        "p3wU7wRITtk",
        "mgmVOuLgFB0",
        "lsSC2vx7zFQ",
        "ZwYy4scOJi8",
        "KxGRhd_iWuE",
      ],
      featured: true,
    },
    {
      id: "fc-rut",
      name: "Get Out of a Rut",
      description: "Fresh perspectives to break stagnant patterns",
      purposeDescription:
        "When you feel stuck or need to break out of your comfort zone",
      purpose: "rut",
      videoCount: 7,
      thumbnails: [
        "https://i.ytimg.com/vi/dItL0dKXFyo/mqdefault.jpg",
        "https://i.ytimg.com/vi/7sxpKhIbr0E/mqdefault.jpg",
        "https://i.ytimg.com/vi/0QXmmP4psbA/mqdefault.jpg",
        "https://i.ytimg.com/vi/jpZnVFlFtlA/mqdefault.jpg",
      ],
      videos: [
        "dItL0dKXFyo",
        "7sxpKhIbr0E",
        "0QXmmP4psbA",
        "jpZnVFlFtlA",
        "mNeXuCYiE0U",
        "vpD5vKocF1Y",
        "Cpc4_9jklRQ",
      ],
      featured: true,
    },
    {
      id: "fc-business",
      name: "Business Insights",
      description: "Strategic content for professional growth",
      purposeDescription:
        "When you need to level up your career or business strategy",
      purpose: "business",
      videoCount: 6,
      thumbnails: [
        "https://i.ytimg.com/vi/bEA1MzCBEsM/mqdefault.jpg",
        "https://i.ytimg.com/vi/Ggfnt_0ujQs/mqdefault.jpg",
        "https://i.ytimg.com/vi/YDjY0dfQ7Cw/mqdefault.jpg",
        "https://i.ytimg.com/vi/w4DkgSw_g4c/mqdefault.jpg",
      ],
      videos: [
        "bEA1MzCBEsM",
        "Ggfnt_0ujQs",
        "YDjY0dfQ7Cw",
        "w4DkgSw_g4c",
        "rPw0JLpuUWI",
        "HKM3r9xvUDU",
      ],
      featured: true,
    },
    {
      id: "fc-inspiration",
      name: "Creative Inspiration",
      description: "Spark your imagination and creative thinking",
      purposeDescription: "When you need fresh ideas or creative stimulation",
      purpose: "inspiration",
      videoCount: 6,
      thumbnails: [
        "https://i.ytimg.com/vi/lkKIuj1yOwQ/mqdefault.jpg",
        "https://i.ytimg.com/vi/9vpqilhW9uI/mqdefault.jpg",
        "https://i.ytimg.com/vi/K67xqY9zCzI/mqdefault.jpg",
        "https://i.ytimg.com/vi/zADxJwEBEGs/mqdefault.jpg",
      ],
      videos: [
        "lkKIuj1yOwQ",
        "9vpqilhW9uI",
        "K67xqY9zCzI",
        "zADxJwEBEGs",
        "rKLQadjGCvc",
        "a78uHX5xYyQ",
      ],
      featured: true,
    },
  ];
};

// Use this to add a featured collection to a user's account
export const saveFeaturedCollection = async (
  supabase,
  userId,
  collectionId
) => {
  const featuredCollections = getFeaturedCollections();
  const collection = featuredCollections.find((c) => c.id === collectionId);

  if (!collection) return null;

  try {
    // Create the collection
    const { data: newCollection, error: collectionError } = await supabase
      .from("playlists") // Keep using the playlists table for now
      .insert({
        user_id: userId,
        title: collection.name,
        description: collection.description,
        purpose: collection.purpose,
        purpose_description: collection.purposeDescription,
        featured_template: collection.id, // Track which featured collection this came from
      })
      .select()
      .single();

    if (collectionError) throw collectionError;

    // Add videos to the collection
    if (collection.videos && collection.videos.length > 0) {
      // First, ensure all videos exist in youtube_videos table
      for (let i = 0; i < collection.videos.length; i++) {
        const videoId = collection.videos[i];

        // Add video to youtube_videos table
        const { error: videoError } = await supabase
          .from("youtube_videos")
          .upsert(
            {
              id: videoId,
              title: `Video ${i + 1}`,
              thumbnail_url: videoId, // Just store the ID, will generate URL in frontend
              channel_title: "Featured Collection",
              description: "",
              view_count: 0,
              published_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (videoError) console.error("Error upserting video:", videoError);

        // Link video to collection
        const { error: playlistVideoError } = await supabase
          .from("playlist_videos")
          .insert({
            playlist_id: newCollection.id,
            video_id: videoId,
            position: i,
          });

        if (playlistVideoError)
          console.error(
            "Error adding video to collection:",
            playlistVideoError
          );
      }
    }

    return newCollection;
  } catch (error) {
    console.error("Error saving featured collection:", error);
    return null;
  }
};
