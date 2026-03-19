import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import dbConnect from '@/lib/mongodb';
import TerminalUser from '@/models/TerminalUser';

export async function GET() {
    try {
        await dbConnect();
        const users = await TerminalUser.find().sort({ timestamp: -1 });
        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Failed to fetch terminal users:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch terminal users',
            details: error.message 
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        await dbConnect();
        const user = await TerminalUser.create({ name });
        return NextResponse.json(user);
    } catch (error: any) {
        console.error('Failed to save terminal user:', error);
        return NextResponse.json({ 
            error: 'Failed to save terminal user',
            details: error.message 
        }, { status: 500 });
    }
}
