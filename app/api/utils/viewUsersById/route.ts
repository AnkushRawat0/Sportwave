import { NextResponse } from 'next/server';
import User from '@/models/user.model';
import connectDB from '@/utils/db';

export const runtime = 'nodejs'

export const GET = async (req: Request) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User ID is required'
                },
                { status: 400 }
            );
        }

        const user = await User.findById(userId)
            .select('-password -__v')
            .lean();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch user',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
