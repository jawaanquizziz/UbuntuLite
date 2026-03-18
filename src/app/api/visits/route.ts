import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Visit from '@/models/Visit';

// Get total visits
export async function GET() {
    try {
        await dbConnect();
        let visit = await Visit.findOne();
        if (!visit) {
            visit = await Visit.create({ totalVisits: 0 });
        }
        return NextResponse.json(visit);
    } catch (error) {
        console.error('Failed to read visits data:', error);
        return NextResponse.json({ error: 'Failed to read visits data' }, { status: 500 });
    }
}

// Increment visits
export async function POST() {
    try {
        await dbConnect();
        let visit = await Visit.findOne();
        if (!visit) {
            visit = await Visit.create({ totalVisits: 1 });
        } else {
            visit.totalVisits += 1;
            await visit.save();
        }
        return NextResponse.json(visit);
    } catch (error) {
        console.error('Failed to update visits data:', error);
        return NextResponse.json({ error: 'Failed to update visits data' }, { status: 500 });
    }
}
