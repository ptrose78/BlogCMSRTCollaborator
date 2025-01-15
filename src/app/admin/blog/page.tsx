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
                await makeProtectedRequest();
            };
            fetchData();
        }
    }, [pathname]);  // Add router.pathname as a dependency

    // Function to refresh the access token
    const refreshAccessToken = async () => {
    const response = await fetch('/api/auth/refresh', { method: 'GET', credentials: 'same-origin' });
  
    if (response.ok) {
        const { accessToken } = await response.json();
        // Save the new access token (e.g., store it in local storage, session, or a state)
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
    } else {
        console.log('Error refreshing token');
        // Redirect to login or handle token expiration
    }
    };
  
    // Function to make a protected request
    const makeProtectedRequest = async () => {
        
    let accessToken = localStorage.getItem('accessToken');
  
    // Make the protected API request with the current access token
    const response = await fetch('/api/protected', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
  
    // If the response is Unauthorized (e.g., token expired), refresh the token and retry the request
    if (response.status === 401) {
        accessToken = await refreshAccessToken(); // Refresh the token
        if (accessToken) {
            // Retry the original request with the new token
            const retryResponse = await fetch('/api/protected', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
  
            if (retryResponse.ok) {
                console.log('Request successful');
            }
        }
    } else {
        console.log('Request successful');
    }
  };

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
