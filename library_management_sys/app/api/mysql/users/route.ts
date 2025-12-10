import { NextResponse } from 'next/server';
import { getAllUsers, getNumUsers } from '@/lib/queries/get_all_users';

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const wantsCount = searchParams.get("count");
    if(wantsCount) {
      const count = await getNumUsers();
      return NextResponse.json({count});
    }

    const users = await getAllUsers();
    return Response.json(users);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ERROR: Get All Users API -', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}