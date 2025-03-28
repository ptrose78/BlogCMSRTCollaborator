"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PostForm from "@/app/components/PostForm";
import { fetchPostById } from "@/app/lib/data";

interface Post {
    id: number;
    title: string;
    content: string;
}

export default function Collaborate() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [post, setPost] = useState<Post | null>(null);

    const [status, setStatus] = useState("Verifying...");
    const [valid, setValid] = useState(false);
    const [isOwner, setIsOwner] = useState(true);

    useEffect(() => {
        async function validateToken() {
            if (!token) {
                setStatus("Invalid invite link.");
                return;
            }

            const response = await fetch("/api/validate-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();
            if (data.success) {
                setValid(true);
                setStatus("Access granted! Loading editor...");
                setIsOwner(data.isOwner); // Store if user is the owner
                
                const response = await fetchPostById(data.postId);
                console.log('response', response)
                setPost(response);
            } else {
                setStatus("Invalid or expired invite link.");
            }
        }

        validateToken();
    }, [token]);

    if (!valid) return <div>{status}</div>;

    return (
        <div>
            <h1>Collaboration Page</h1>
            <p>You can now edit the post.</p>
            {post && <PostForm initialPost={post} isOwner={isOwner} />}
        </div>
    );
}
