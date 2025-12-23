import connectDB from "@/utils/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { generateToken } from "@/utils/generatetoken";
export const runtime = 'nodejs'

export const POST = async (req) => {
    try {
        await connectDB();
        const { email, password } = await req.json();
        
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
        
        await generateToken(user);
        return NextResponse.json({ message: "Login successful" }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}   