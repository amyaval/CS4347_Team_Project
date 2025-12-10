import { NextResponse } from 'next/server';
import { getBorrowerLoans } from '@/lib/queries/borrower_loans';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const loans = await getBorrowerLoans(cardId);
    return NextResponse.json({ success: true, data: loans });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ERROR: Get Borrower Loans API -', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

