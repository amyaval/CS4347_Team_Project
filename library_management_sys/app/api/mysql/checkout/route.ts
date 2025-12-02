import { NextResponse } from 'next/server';
import { checkout } from '@/lib/queries/check_out';

export async function POST(request: Request) {
  try {
    const { ISBN, Card_id } = await request.json();

    if (!ISBN || !Card_id) {
      return Response.json({ error: 'ISBN AND Card_id are required' }, { status: 400 });
    }
    
    const result = await checkout(ISBN, Card_id);
    return Response.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ERROR: Checkout API -', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

