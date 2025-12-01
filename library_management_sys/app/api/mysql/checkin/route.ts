import { NextResponse } from 'next/server';
import { searchBookLoans } from '@/lib/queries/check_in_search';
import { checkInBooks } from '@/lib/queries/check_in';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    if (!searchTerm) {
      return Response.json({ error: 'Search term is required' }, { status: 400 });
    }

    const results = await searchBookLoans(searchTerm);
    return Response.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ERROR: Check-in Search API -', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { loanIds } = await request.json();

    if (!loanIds || !Array.isArray(loanIds)) {
      return Response.json({ error: 'loanIds array is required' }, { status: 400 });
    }

    if (loanIds.length === 0 || loanIds.length > 3) {
      return Response.json({ error: 'You must select between 1 and 3 loans to check in' }, { status: 400 });
    }

    const results = await checkInBooks(loanIds);
    return Response.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ERROR: Check-in API -', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

