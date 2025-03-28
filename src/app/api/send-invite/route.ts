import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabaseServer";
import { sendEmail } from "@/app/lib/email";

export async function POST(req: NextRequest) {
    try {
        const { email, postId } = await req.json();
        if (!email || !postId) {
            return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
        }

        const supabase = await supabaseServer();
        const token = crypto.randomUUID(); 
        const { error } = await supabase.from("collaborators").insert([{ 
            post_id: postId, 
            email, 
            token
        }]);

        if (error) throw error;

        const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/collaborate?token=${token}`;

        const emailSent = await sendEmail(email, "You're Invited to Collaborate!", `
            <p>You have been invited to collaborate on a blog post.</p>
            <p><a href="${inviteLink}">Click here</a> to start editing the post.</p>
        `);

        if (!emailSent) {
            return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Invite sent successfully!" });

    } catch (error) {
        console.error("Invite error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
