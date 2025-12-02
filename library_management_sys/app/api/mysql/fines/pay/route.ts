import { NextResponse } from 'next/server';
import { payFinesForCard } from '@/lib/queries/fines';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { card_id } = body;
    if (!card_id) {
      return NextResponse.json({ success: false, error: 'card_id is required' }, { status: 400 });
    }

    const res = await payFinesForCard(card_id);
    return NextResponse.json({ success: true, result: res });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
