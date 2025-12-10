import { executeQuery } from '@/lib/db';
import { error } from 'console';

export interface User {
    Card_ID: string;
    Ssn: string;
    Bname: string;
    Address: string;
    Phone: string;
}

export async function getAllUsers(): Promise<User []> {
    try {
        const query = 'SELECT Card_ID, Ssn, Bname, Address, Phone FROM BORROWER';
        const results = await executeQuery({query});

        return results as User[];
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}