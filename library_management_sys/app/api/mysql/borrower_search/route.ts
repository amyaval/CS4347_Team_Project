import { NextResponse } from 'next/server';
import { allBorrowers, addBorrower, getBorrowerBySsn } from '@/lib/queries/borrower_management';

export async function GET(request: Request) {
    try {
        const borrowers = await allBorrowers();

        const formattedBorrowers = borrowers.map(b => ({
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ssn, bname, address, phone } = body;

        // Basic validation
        if (!ssn || !bname || !address || !phone) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check for duplicate SSN
        const existingUser = await getBorrowerBySsn(ssn);
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'A borrower with this SSN already exists' },
                { status: 400 }
            );
        }

        // Add borrower (auto-assign Card_ID)
        const newCardID = await addBorrower(ssn, bname, address, phone);

        return NextResponse.json({
            success: true,
            message: 'Borrower added successfully',
            CardID: newCardID,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, message: 'Error adding borrower', error: errorMessage },
            { status: 500 }
        );
    }
}
