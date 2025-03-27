'use client';

import { useEffect } from "react";
import { usePathname } from 'next/navigation'; 
import PostForm from "@/app/components/PostForm";
import PostSection from "@/app/components/PostSection";

export default function BlogAdminPage() {
    
    const pathname = usePathname(); 

    useEffect(() => {
        // Check if the current path is /admin/blog
        if (pathname === '/admin/blog') {
            const fetchData = async () => {
                // await makeProtectedRequest();
                console.log('blog page')
            };
            fetchData();
        }
    }, [pathname]);  // Add router.pathname as a dependency

    return (
        <div className="mx-auto p-6 bg-white shadow-md rounded-lg">
            <div className="grid grid-cols-7 gap-1">
                <div className="col-span-5">
                    <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
                    <PostForm />
                </div>
                <div className="col-span-2">
                    <PostSection />
                </div>
            </div>
        </div>
    );
}
