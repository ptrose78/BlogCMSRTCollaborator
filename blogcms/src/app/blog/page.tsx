import PostCard from "@/app/components/PostCard";
import { fetchPosts } from "@/app/lib/data";

export default async function BlogPage() {
    // Fetch data
    const posts = await fetchPosts();

    return (
        <div className="bg-gray-50 min-h-screen py-10">
          
            {/* Posts Section */}
            <section className="max-w-screen-xl mx-auto px-6">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Other Posts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </section>
        </div>
    );
}
