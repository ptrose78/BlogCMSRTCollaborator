import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

const signupFormSchema = z.object({
    username: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Validate the form fields using Zod schema
        const validatedFields = signupFormSchema.safeParse({
            username: formData.get("username"),
            password: formData.get("password"),
        });

        if (!validatedFields.success) {
            const errors = validatedFields.error.flatten().fieldErrors;
            return NextResponse.json({ errors, message: "Invalid input data", success: false }, { status: 400 });
        }

        const { username, password } = validatedFields.data;
        console.log('username', username)
        console.log('password', password)

        // Sign up the user with Supabase Auth
        const { data: { user }, error: signupError } = await supabase.auth.signUp({
            email: username, // Use email as the username
            password: password
        });

        console.log('user', user)
        console.log('signupError', signupError)

        if (signupError) {
            throw new Error("Failed to create user.");
        }

        // Generate JWT Tokens (if necessary)
        const accessToken = user?.access_token; // Access token returned by Supabase
        const refreshToken = user?.refresh_token; // Refresh token returned by Supabase

        const response = NextResponse.json({
            message: "Signup Successful!",
            success: true,
            accessToken,
            refreshToken,
        });

        // Set authentication cookies (use tokens from Supabase)
        response.cookies.set("authToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: "/",
            maxAge: 15 * 60, // 15 minutes
        });

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        console.log('response', response)
        console.log('response.ok', response.ok)

        return response;

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ message: "Failed to signup.", success: false }, { status: 500 });
    }
}
