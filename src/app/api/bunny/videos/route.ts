import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_API_KEY;

    if (!libraryId || !apiKey) {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Bunny videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 