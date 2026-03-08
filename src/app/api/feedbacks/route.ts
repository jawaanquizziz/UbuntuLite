import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const dataFilePath = isProduction
    ? path.join('/tmp', 'feedbacks.json')
    : path.join(process.cwd(), 'data', 'feedbacks.json');

async function ensureDataFile() {
    try {
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
        try {
            await fs.access(dataFilePath);
        } catch {
            await fs.writeFile(dataFilePath, JSON.stringify([]));
        }
    } catch (err) {
        console.error('Error ensuring data file:', err);
    }
}

export async function GET() {
    await ensureDataFile();
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        const feedbacks = JSON.parse(data || '[]');
        return NextResponse.json(feedbacks);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to read feedbacks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await ensureDataFile();
    try {
        const newFeedback = await request.json();
        const data = await fs.readFile(dataFilePath, 'utf-8');
        let feedbacks = JSON.parse(data || '[]');

        feedbacks.push({
            ...newFeedback,
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        if (feedbacks.length > 100) {
            feedbacks = feedbacks.slice(-100);
        }

        await fs.writeFile(dataFilePath, JSON.stringify(feedbacks, null, 2));

        return NextResponse.json({ success: true, feedbacks });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await ensureDataFile();
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const data = await fs.readFile(dataFilePath, 'utf-8');
        let feedbacks: any[] = JSON.parse(data || '[]');

        feedbacks = feedbacks.filter(fb => fb.id !== id);

        await fs.writeFile(dataFilePath, JSON.stringify(feedbacks, null, 2));

        return NextResponse.json({ success: true, feedbacks });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
    }
}
