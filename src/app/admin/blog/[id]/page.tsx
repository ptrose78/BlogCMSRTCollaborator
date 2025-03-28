

import { fetchPostById } from "@/app/lib/data";
import PostForm from "@/app/components/PostForm"
import InviteButton from "@/app/components/InviteButton"

export default async function PostAdminPage({params}:{params: { id: string }}) {

    const post = await fetchPostById(params.id);
     
    if (!post) {
        return <div>Post not found</div>; // Handle cases where the post doesn't exist
      }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Update Post</h1>
            <PostForm initialPost={post} isOwner={true} />
            <InviteButton initialPost={post}/>
        </div>
    )
}