import { NextResponse } from 'next/server';
import Event from '@/models/event.model';
import connectDB from '@/utils/db';
import User from '@/models/user.model';
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
        
        const events = await User.findById(userId)
            .populate('events_booked')
            .select('events_booked');
            
        if (!events) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json(events);

    }
    catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}