import { NextResponse } from 'next/server';
import { getNumBooks } from '@/lib/queries/book_search_availability';
import { getNumCheckOut } from '@/lib/queries/check_out';

export async function GET(request: Request) {
    try {
        const numBooks = await getNumBooks();
        const numCheckOut = await getNumCheckOut();
        return NextResponse.json({ numBooks, numCheckOut});
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('ERROR: Get All Users API -', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}