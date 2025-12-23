import { NextResponse } from 'next/server';
import User from '@/models/user.model';
import connectDB from '@/utils/db';

export const runtime = 'nodejs'

export const GET = async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const sportType = searchParams.get('sport');
        const name = searchParams.get('name');
        const age = searchParams.get('age');
        const minAge = searchParams.get('minAge');
        const maxAge = searchParams.get('maxAge');
        
        // Build the filter object
        const filter = {};

        // Filter by sport type (case-insensitive)
        if (sportType) {
            filter.sports = { $regex: new RegExp(sportType, 'i') };
        }

        // Filter by name (case-insensitive partial match)
        if (name) {
            filter.name = { $regex: new RegExp(name, 'i') };
        }

        // Filter by exact age
        if (age && !isNaN(parseInt(age))) {
            filter.age = parseInt(age);
        }

        // Filter by age range (only if exact age is not provided)
        if (!age && ((minAge && !isNaN(parseInt(minAge))) || (maxAge && !isNaN(parseInt(maxAge))))) {
            const ageFilter = {};
            if (minAge && !isNaN(parseInt(minAge))) {
                ageFilter.$gte = parseInt(minAge);
            }
            if (maxAge && !isNaN(parseInt(maxAge))) {
                ageFilter.$lte = parseInt(maxAge);
            }
            filter.age = ageFilter;
        }

        const users = await User.find(filter)
            .select('-password -__v')
            .lean()
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            count: users.length,
            data: users,
            filters: {
                sport: sportType,
                name: name,
                age: age,
                minAge: minAge,
                maxAge: maxAge
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch users',
                message: error.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
