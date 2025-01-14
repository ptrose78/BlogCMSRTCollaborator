// app/actions.ts
"use server"; 

import { sql } from '@vercel/postgres';
import { neon } from "@neondatabase/serverless";
import { revalidatePath } from 'next/cache';

export async function fetchPosts() {
    try {
      const sql = neon(process.env.POSTGRES_URL);
      const posts = await sql`
        SELECT * FROM posts`
  
        console.log(posts)
        
       return posts
    } catch(error) {
      console.error("Database error:", error);
      throw new Error("Failed to retrieve posts.");
    }
  }

  export async function fetchPostById(id: number) {
    try {
  
      const sql = neon(process.env.POSTGRES_URL);
  
      const post = await sql`
      SELECT * FROM posts WHERE id = ${id} LIMIT 1`;
  
      return post[0] || null;
  
    } catch(error){
      console.error("Database Error:", error);
      throw new Error("Failed to retrieve the post.");
    }
  }

  export async function createPost(post){
  try {
    if (!post.title) {
      throw new Error("Post title and content are required.");
    }

    const sql = neon(process.env.POSTGRES_URL);
    const [result] = await sql`
      INSERT INTO posts (title, content, featured, excerpt)
      VALUES (${post.title}, ${post.content}, ${post.featured}, ${post.excerpt})
      RETURNING id`

      revalidatePath("/admin/blog")
      return {
        success: true,
        message: "Post submitted successfully."
      }
  } catch(error) {
    console.error("Database Error:", error);
    throw new Error("Failed to add the post.");
  }
}

export async function updatePost(id: number, post: { title?: string; content?: string; featured?: boolean; excerpt?: string; archived?: boolean }) {
  try {
      const sql = neon(process.env.POSTGRES_URL);

      // Construct the update query dynamically to only update provided fields
      const updates: string[] = [];
      const values: any[] = [];

      if (post.title !== undefined) {
          updates.push('title = $1');
          values.push(post.title);
      }

      if (post.content !== undefined) {
          updates.push('content = $2');
          values.push(post.content);
      }

      if (post.featured !== undefined) {
        updates.push('featured = $3');
        values.push(post.featured);
      }

      if (post.excerpt !== undefined) {
        updates.push('excerpt = $4');
        values.push(post.excerpt);
      }

      if (post.archived !== undefined) {
        updates.push('archived = $5');
        values.push(post.archived);
      }

      if (updates.length === 0) {
          return { success: true, message: "No fields to update." }; // Nothing to update
      }

      const query = `
          UPDATE posts
          SET ${updates.join(', ')}
          WHERE id = $${values.length + 1}
      `;

      // Debugging log
      console.log("Executing query:", query);
      console.log("With values:", values);

      values.push(id); // Add the id to the values array

      const result = await sql(query, values);

      if (result.rowCount === 0) {
          return { success: false, message: "Post not found." }; // No rows updated, post probably doesn't exist
      }

      revalidatePath("/admin/blog")
      return { success: true, message: "Post updated successfully." };
  } catch (error) {
      console.error("Database error:", error);
      return { success: false, message: "Failed to update post." };
  }
}

export async function deletePost(post) {
  try {
    const sql = neon(process.env.POSTGRES_URL);

    const result = await sql`
    DELETE FROM posts WHERE id = ${post.id}
    `
    if (result.rowCount === 0) {
      return {
        success: false,
        message: "Post not found or already deleted.",
      };
    }

    revalidatePath("/admin/blog");

    return {
      success: true,
      message: "Post successfully deleted."
    }

  } catch(error) {
    console.error("Database error:", error);
    throw new Error("Failed to delete post.")
  }
}