import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const authToken = req.cookies.get("authToken")?.value;

        if (!authToken) {
            return NextResponse.json({ message: "No token provided" }, { status: 401 });
        }

       // Reinitialize Supabase client with token
       const supabaseServer = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { global: { headers: { Authorization: `Bearer ${authToken}` } } }
        );

        // Verify token and get user ID
        const { data, error } = await supabaseServer.auth.getUser();
        if (error || !data?.user?.id) {
            return NextResponse.json({ message: "Invalid token or user not found" }, { status: 401 });
        }

        const postData = await req.json();

        if (!postData.title) {
            throw new Error("Post title is required.");
        }

        // Remove empty `id` to let Supabase generate it automatically
        const { id, ...postWithoutId } = postData;
    
        const { data: newPost, error: postError } = await supabaseServer
            .from("posts")
            .insert([
                postWithoutId
            ])
            .select()
            .single();

        if (postError) {
            console.error("postError", postError);
            return NextResponse.json({ message: postError.message }, { status: 500 });
        }

        revalidatePath("/admin/blog");

        return NextResponse.json({ success: true, message: "Post submitted successfully.", post: newPost });

    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ message: "Error creating post" }, { status: 500 });
    }
}

