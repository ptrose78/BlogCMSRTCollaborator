import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fetchUserById } from '@/app/lib/data';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const signupFormSchema = z.object({
    username: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const SECRET_KEY = process.env.JWT_SECRET!;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET!;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const validatedFields = signupFormSchema.safeParse({
            username: formData.get("username"),
            password: formData.get("password"),
        });

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            return NextResponse.json({ errors, message: "Invalid input data", success: false }, { status: 400 });
        }

        const { username, password } = validatedFields.data;

        // Check if user already exists
        const existingUser = await fetchUserById(username);
        if (existingUser && existingUser.id) {
            return NextResponse.json({ message: "User already exists!", success: false }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('hashedPassword', hashedPassword);

        // Insert new user into Supabase
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ email: username, password: hashedPassword }])
            .select('id')
            .single();


        if (insertError) {
            throw new Error("Failed to create user.");
        }

        // Generate JWT tokens
        const accessToken = jwt.sign({ userId: newUser.id }, SECRET_KEY, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: newUser.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

        const response = NextResponse.json({
            message: "Signup Successful!",
            success: true,
            accessToken,
            refreshToken
        });

        // Set authentication cookies
        response.cookies.set("authToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: "/",
            maxAge: 15 * 60,
        });

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ message: "Failed to signup.", success: false }, { status: 500 });
    }
}
