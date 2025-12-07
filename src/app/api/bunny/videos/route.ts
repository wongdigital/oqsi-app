import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_API_KEY;
    const pullZone = process.env.BUNNY_PULL_ZONE;

    if (!libraryId || !apiKey || !pullZone) {
      return NextResponse.json(
        { error: 'Missing required Bunny environment variables' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'AccessKey': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch videos: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Include pull zone in response so client doesn't need NEXT_PUBLIC_ variable
    return NextResponse.json({ ...data, pullZone });
  } catch (error) {
    console.error('Error fetching Bunny videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 