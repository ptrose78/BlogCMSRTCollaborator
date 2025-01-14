// app/actions.ts
"use server"; 

import { sql } from '@vercel/postgres';
import { neon } from "@neondatabase/serverless";

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