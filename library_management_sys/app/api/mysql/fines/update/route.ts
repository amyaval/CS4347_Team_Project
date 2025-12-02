import { NextResponse } from 'next/server';
import { updateFines } from '@/lib/queries/fines';

export async function POST() {
  try {
    const res = await updateFines();
    return NextResponse.json({ success: true, result: res });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
