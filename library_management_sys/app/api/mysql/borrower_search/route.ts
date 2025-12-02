import { NextResponse } from 'next/server';
import { allBorrowers } from '@/lib/queries/borrower_management';

export async function GET(request: Request) {
    try {
        const borrowers = await allBorrowers();

        const formattedBorrowers = borrowers.map((b) => ({
            CardID: b.Card_ID,
            ssn: b.Ssn,
            bname: b.Bname,
            address: b.Address,
            phone: b.Phone,
        }));

        return NextResponse.json({ success: true, data: formattedBorrowers });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, message: 'Error fetching borrowers', error: errorMessage },
            { status: 500 }
        );
    }
}
