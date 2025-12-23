import connectDB from "@/utils/db";
import TempUser from "@/models/temp.user.model";
import { NextResponse } from "next/server";
import User from "@/models/user.model";
export const runtime = 'nodejs'



export const POST = async (req) => {
    try {
        await connectDB();
        const { email, otp } = await req.json();
        
        if (!email || !otp) {
            return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
        }
        
        const user = await TempUser.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found or OTP expired" }, { status: 400 });
        }
        
        if (user.otp !== otp) {
            return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            await TempUser.deleteOne({ email });
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const newUser = new User({ email, password: user.password, name: user.name });
        await newUser.save();
        await TempUser.deleteOne({ email });
        
        return NextResponse.json({ message: "Account created successfully" }, { status: 200 });
    } catch (error) {
        console.error('OTP verification error:', error);
        return NextResponse.json({ message: "An error occurred during verification" }, { status: 500 });
    }
}