import { NextResponse } from 'next/server';
import { book_search_availability } from '@/lib/queries/book_search_availability';

export async function GET(request: Request) {
  try {
    // Get the search term from the URL query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    
    if (!searchTerm) {
      return Response.json({ error: 'Search term is required' }, { status: 400 });
    }
    
    // Call your function with the search term
    const results = await book_search_availability(searchTerm);
    
    return Response.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ERROR: API - ', errorMessage);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}