import { NextResponse } from 'next/server';
import { book_search_availability } from '@/lib/queries/book_search_availability';
import { checkout } from '@/lib/queries/check_out';

export async function GET(request: Request) {
  try {
    // Get the search term from the URL query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    
    if (!searchTerm) {
      return Response.json({ error: 'Search term is required' }, { status: 400 });
    }
    
    // Call function with the search term
    const results = await book_search_availability(searchTerm);
    
    return Response.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ERROR: API - ', errorMessage);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try{
    const {ISBN, Card_id} = await request.json();

    if(!ISBN || !Card_id) {
      return Response.json({error: 'ISBN AND Card_id are required'}, {status: 400});
    }
    const result = await checkout(ISBN, Card_id);
    return Response.json(result);
  }
  catch(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ERROR: Checkout API -', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}