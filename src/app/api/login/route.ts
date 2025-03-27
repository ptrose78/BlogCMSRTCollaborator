import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/app/lib/supabaseClient";

const loginFormSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(req: Request) {
  console.log("Login API route running");

  const formData = await req.formData();

  const validatedFields = loginFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return NextResponse.json(
      { message: "Invalid input data", success: false, status: 400 },
      { status: 400 }
    );
  }

  const { username, password } = validatedFields.data;

  try {
    // Sign in user using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username, // Assuming username is an email
      password: password,
    });

    if (error) {
      return NextResponse.json(
        { message: error.message, success: false, status: 401 },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { message: "Failed to retrieve session", success: false },
        { status: 500 }
      );
    }
   
    const response = NextResponse.json({
        message: "Login Successful!",
        success: true,
        user: data.user,
      });

    if (data.session.access_token) {
        response.cookies.set('authToken', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
        });
    }

    return response;

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { message: "Failed to login.", success: false },
      { status: 500 }
    );
  }
}
