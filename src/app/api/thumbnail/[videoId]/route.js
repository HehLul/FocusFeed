// app/api/thumbnail/[videoId]/route.js
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { videoId } = params;

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  // Generate YouTube thumbnail URL
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  try {
    // Fetch the image
    const response = await fetch(thumbnailUrl);

    if (!response.ok) {
      console.error(
        `Error fetching thumbnail for ${videoId}: ${response.status}`
      );

      // Try a fallback thumbnail size
      const fallbackUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
      const fallbackResponse = await fetch(fallbackUrl);

      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: "Thumbnail not available" },
          { status: 404 }
        );
      }

      // Get the image data from the fallback
      const imageBuffer = await fallbackResponse.arrayBuffer();

      // Return the image with appropriate headers
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type":
            fallbackResponse.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error in thumbnail proxy:", error);
    return NextResponse.json(
      { error: "Failed to fetch thumbnail" },
      { status: 500 }
    );
  }
}
