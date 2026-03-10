import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'visits.json');

// Get total visits
export async function GET() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify({ totalVisits: 0 }));
        }
        const rawData = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(rawData);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read visits data' }, { status: 500 });
    }
}

// Increment visits
export async function POST() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify({ totalVisits: 0 }));
        }
        const rawData = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(rawData);

        data.totalVisits += 1;

        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update visits data' }, { status: 500 });
    }
}
