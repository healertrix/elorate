import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&append_to_response=videos`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Add video information to each movie result
    const resultsWithVideo = await Promise.all(data.results.map(async (movie: any) => {
      try {
        const videoResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`,
          { next: { revalidate: 60 } } // Cache for 60 seconds
        );
        
        if (!videoResponse.ok) {
          throw new Error(`TMDB API responded with status: ${videoResponse.status}`);
        }

        const videoData = await videoResponse.json();
        const trailer = videoData.results.find((video: any) => video.type === 'Trailer');
        return { ...movie, video: trailer ? trailer.key : null };
      } catch (error) {
        console.error(`Error fetching video for movie ${movie.id}:`, error);
        return { ...movie, video: null };
      }
    }));

    return NextResponse.json({ ...data, results: resultsWithVideo });
  } catch (error) {
    console.error('Error searching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies. Please try again later.' }, { status: 500 });
  }
}