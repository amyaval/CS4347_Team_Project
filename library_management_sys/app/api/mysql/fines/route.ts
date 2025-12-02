import { NextResponse } from 'next/server';
import { listFines } from '@/lib/queries/fines';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includePaid = searchParams.get('includePaid') === '1' || searchParams.get('includePaid') === 'true';
    const results = await listFines(includePaid);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
