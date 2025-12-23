import { NextResponse } from 'next/server';
import Event from '@/models/event.model';
import connectDB from '@/utils/db';

export const runtime = 'nodejs'


export async function GET(request) {
    function getDistanceInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport');
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const price = searchParams.get('price');
    const NoOfSeats = searchParams.get('NoOfSeats');
    const isActive = searchParams.get('isActive') || 'true';
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    try {
        await connectDB();

        if (!lat || !lng) {
            return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
        }

        // Build MongoDB query for database-level filtering
        const query = { isActive: true };

        if (sport) query.sport = new RegExp(sport, 'i');
        if (location) query.location = new RegExp(location, 'i');
        if (date) query.date = date;
        if (time) query.time = time;
        if (price) query.price = { $lte: price };
        if (NoOfSeats) query.NoOfSeats = { $gte: NoOfSeats };

        // Use lean() for faster queries (returns plain JS objects, not Mongoose documents)
        let events = await Event.find(query)
            .lean()
            .limit(limit * 2) // Fetch more to account for distance filtering
            .select('_id name description sport location date time price NoOfSeats lat lng players');

        // Apply distance filtering in memory (more efficient after DB filtering)
        events = events.filter(event => {
            const distance = getDistanceInKm(parseFloat(lat), parseFloat(lng), event.lat, event.lng);
            return distance <= radius;
        });

        // Apply search filter if provided
        if (search) {
            const searchLower = search.toLowerCase();
            events = events.filter(event =>
                event.name?.toLowerCase().includes(searchLower) ||
                event.description?.toLowerCase().includes(searchLower) ||
                event.location?.toLowerCase().includes(searchLower) ||
                event.sport?.toLowerCase().includes(searchLower)
            );
        }

        // Pagination
        const skip = (page - 1) * limit;
        const paginatedEvents = events.slice(skip, skip + limit);
        const total = events.length;

        return NextResponse.json({
            events: paginatedEvents,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });
    } catch (error) {
        console.error('Get events error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 