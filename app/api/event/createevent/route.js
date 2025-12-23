import { NextResponse } from 'next/server';
import Event from '@/models/event.model';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs'


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        const { name, description, location, sport, date, time, price, images, players, host, NoOfSeats, isActive, pin, lat, lng, detailedLocation } = await request.json();
        
        // Validate required fields
        if (!name || !description || !location || !sport || !date || !host || !NoOfSeats || !pin) {
            return NextResponse.json({ 
                error: "Missing required fields: name, description, location, sport, date, host, NoOfSeats, pin" 
            }, { status: 400 });
        }

        const image_urls = [];
        if (images && Array.isArray(images) && images.length > 0) {
            for (const image of images) {
                try {
                    const result = await cloudinary.uploader.upload(image);
                    image_urls.push(result.secure_url);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                }
            }
        }
        
        const eventData = {
            name,
            description,
            location,
            sport,
            date,
            time: time || '',
            price: price || 0,
            image_urls: image_urls,
            players: players || [],
            host,
            NoOfSeats,
            isActive: isActive !== undefined ? isActive : true,
            pin,
            lat: lat || 0,
            lng: lng || 0,
            detailedLocation: detailedLocation || ''
        };
        
        const event = await Event.create(eventData);
        
        if (!event) {
            return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
        }
        
        return NextResponse.json({ message: "Event created successfully", event: event }, { status: 200 });
    } catch (error) {
        console.error('Create event error:', error);
        return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
    }
}