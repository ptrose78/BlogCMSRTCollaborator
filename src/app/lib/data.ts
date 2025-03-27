"use server";

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/app/lib/supabaseServer';

export async function fetchPosts() {
    try {
        const supabase = await supabaseServer();
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
        const supabase = await supabaseServer();
        console.log('id', id)
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
        const supabase = await supabaseServer();
        if (!post.title) {
            throw new Error("Post title and content are required.");
        }      
        
        // Remove empty `id` to let Supabase generate it automatically
        const { id, ...postWithoutId } = post;

        console.log('postWithoutId', postWithoutId)

        // Insert post into 'posts' table
        const { data: newPost, error: postError } = await supabase
            .from("posts")
            .insert([ postWithoutId ])
            .select()
            .single();

           console.log('postError', postError) 
        if (postError) throw postError;

        // Insert the user as the 'owner' in the 'post_collaborators' table
        // const { error: collaboratorError } = await supabase
        //     .from("post_collaborators")
        //     .insert([
        //         {
        //             post_id: newPost.id, // Use the newly generated UUID
        //             user_id: userId,
        //             role: "owner",
        //         },
        //     ]);

        // if (collaboratorError) throw collaboratorError;

        revalidatePath("/admin/blog");
        return { success: true, message: "Post submitted successfully." };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to add the post.");
    }
}


export async function updatePost(post, id) {
    try {
        const supabase = await supabaseServer();
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
        const supabase = await supabaseServer();
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
        const supabase = await supabaseServer();
        const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Database error:", error);
        return { message: "User does not exist.", status: 500 };
    }
}
