import { NextResponse } from 'next/server';
import Event from '@/models/event.model';
import connectDB from '@/utils/db';
import jwt from "jsonwebtoken";


export const GET = async (req) => {
    try {
        await connectDB();
        const tokenCookie = req.cookies.get("token");
        
        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
        }
        
        const token = tokenCookie.value;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const events = await Event.find({ host: userId });
        
        if (events.length === 0) {
            return NextResponse.json({ error: 'No events found' }, { status: 404 });
        }

        return NextResponse.json(events);

    }
    catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}