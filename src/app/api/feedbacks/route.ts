import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET() {
    try {
        await dbConnect();
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(100);
        return NextResponse.json(feedbacks);
    } catch (err) {
        console.error('Failed to read feedbacks:', err);
        return NextResponse.json({ error: 'Failed to read feedbacks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const newFeedback = await request.json();
        
        const feedback = await Feedback.create({
            ...newFeedback,
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(100);

        return NextResponse.json({ success: true, feedbacks });
    } catch (err) {
        console.error('Failed to save feedback:', err);
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await Feedback.deleteOne({ id });
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(100);

        return NextResponse.json({ success: true, feedbacks });
    } catch (err) {
        console.error('Failed to delete feedback:', err);
        return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
    }
}
