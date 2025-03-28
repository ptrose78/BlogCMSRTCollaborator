import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabaseServer";

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();
        if (!token) {
            return NextResponse.json({ success: false, message: "Invalid token." }, { status: 400 });
        }

        const supabase = await supabaseServer();

        // Look up invite token
        const { data: invite, error } = await supabase
            .from("collaborators")
            .select("post_id, email")
            .eq("token", token)
            .single();

        if (!invite || error) {
            return NextResponse.json({ success: false, message: "Invalid or expired token." }, { status: 400 });
        }

        // Get post details
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select("id, owner_email")
            .eq("id", invite.post_id)
            .single();

        if (!post || postError) {
            return NextResponse.json({ success: false, message: "Post not found." }, { status: 400 });
        }

        // Check if user is owner
        const isOwner = invite.email === post.owner_email;
        console.log('isOwner', isOwner)
        console.log('post.owner_email', post.owner_email)
        console.log('invite.email', invite.email)

        return NextResponse.json({ success: true, postId: post.id, isOwner });

    } catch (error) {
        console.error("Validation error:", error);
        return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
    }
}
