"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';


if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function fetchPosts() {
    try {
        const { data, error } = await supabase.from('posts').select('*');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve posts.");
    }
}

export async function fetchPostById(id) {
    try {
        const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve the post.");
    }
}

export async function createPost(post) {
    try {
        if (!post.title) {
            throw new Error("Post title and content are required.");
        }

        const { error } = await supabase.from('posts').insert([post]);
        if (error) throw error;

        revalidatePath("/admin/blog");
        return { success: true, message: "Post submitted successfully." };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to add the post.");
    }
}

export async function updatePost(id, post) {
    try {
        const { error } = await supabase.from('posts').update(post).eq('id', id);
        if (error) throw error;

        revalidatePath("/admin/blog");
        return { success: true, message: "Post updated successfully." };
    } catch (error) {
        console.error("Database error:", error);
        return { success: false, message: "Failed to update post." };
    }
}

export async function deletePost(post) {
    try {
        const { error } = await supabase.from('posts').delete().eq('id', post.id);
        if (error) throw error;

        revalidatePath("/admin/blog");
        return { success: true, message: "Post successfully deleted." };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to delete post.");
    }
}

export async function fetchUserById(username) {
    try {
        const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Database error:", error);
        return { message: "User does not exist.", status: 500 };
    }
}
