// src/app/api/youtube/search-channels/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ 
      error: 'Search query is required' 
    }, { status: 400 });
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=10`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube channels');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('YouTube API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to search YouTube channels' 
    }, { status: 500 });
  }
}