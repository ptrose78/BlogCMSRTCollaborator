'use server';
 
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { neon } from "@neondatabase/serverless";

const signupFormSchema = z.object({
    id: z.string(),
    username: z.string(),
    password: z.string()
})

const HandleSignup = signupFormSchema.omit({id: true})

async function fetchUserById(username:string) {
    const sql = neon(process.env.POSTGRES_URL);
    const result = await sql`
    SELECT * FROM users WHERE username = ${username}
    `;
    return result.length > 0 ? result[0] : null;
}

export async function handleSignup(formData: FormData) {
    const validatedFields = HandleSignup.safeParse({
        username: formData.get("username"),
        password: formData.get("password")
    })

    if (!validatedFields.success) {
        return {message: "Invalid input data.", status: 400}
    }
    
    const {username, password} = validatedFields.data;
    console.log(password)

    const sql = neon(process.env.POSTGRES_URL);

    const user = await fetchUserById(username);

    if (user) {
        return {message:"User already exists!", status: 400}
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await sql`
        INSERT INTO users (username, password)
        VALUES (${username}, ${hashedPassword})
        returning id
        `

        return { message: "User created!", status: 200 };
        
    } catch(error) {
        console.error("Database error:", error);
        return { message: "Failed to signup.", status: 500 };
    }
}
