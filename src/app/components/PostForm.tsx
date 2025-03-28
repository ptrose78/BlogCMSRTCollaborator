'use client';

import { useState } from 'react';
import {
    EditorState,
    convertToRaw,
    RichUtils,
    convertFromRaw,
} from 'draft-js';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import "draft-js/dist/Draft.css";
import { createPost, updatePost } from '@/app/lib/data';

// Dynamically load the Editor component (SSR disabled)
const Editor = dynamic(() => import('draft-js').then(mod => mod.Editor), { ssr: false });

interface Post {
    id?: number;
    title?: string;
    content?: string;
    excerpt?: string;
    featured?: boolean;
    archived?: boolean;
}

interface PostFormProps {
    initialPost?: Post;
    isOwner?: boolean;
}

export default function PostForm({ initialPost, isOwner }: PostFormProps) {
    const initialContent = initialPost?.content
        ? EditorState.createWithContent(convertFromRaw(JSON.parse(initialPost.content)))
        : EditorState.createEmpty();

    const [editorState, setEditorState] = useState(initialContent);
    const [post, setPost] = useState<Post>(initialPost || {});
    const [status, setStatus] = useState('');

    console.log('isOwner', isOwner)

     // Handle input changes
    const handlePostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.currentTarget;
        setPost(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Toggle block styles in the editor
    const toggleBlockType = (blockType: string) => {
        setEditorState(RichUtils.toggleBlockType(editorState, blockType));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("Submitting...");

        const rawContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        const updatedPost = { ...post, content: rawContent };

        try {
            const response = post.id ? await updatePost(updatedPost, post.id) : await createPost(updatedPost);

            if (response.success) {
                setStatus(response.message);
                if (!post.id) {
                    resetForm();
                }
            } else {
                throw new Error(response.message || "Failed to post. Please try again.");
            }
        } catch (error) {
            console.error(error);
            setStatus(error.message);
        }
    };

    // Reset form state after successful submission
    const resetForm = () => {
        setPost({ title: '', content: '', featured: false });
        setEditorState(EditorState.createEmpty());
    };

    return (
        <div className="mx-auto p-6 bg-white shadow-md rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title Input */}
                <InputField
                    label="Post Title"
                    name="title"
                    placeholder="Title"
                    value={post.title || ""}
                    onChange={handlePostChange}
                    required
                />

                {/* Excerpt Input */}
                <InputField
                    label="Post Excerpt"
                    name="excerpt"
                    placeholder="Excerpt"
                    value={post.excerpt || ""}
                    onChange={handlePostChange}
                    required
                />

                {/* Text Formatting Buttons */}
                <TextFormatButtons toggleBlockType={toggleBlockType} />

                {/* Editor */}
                <div
                    className="mt-1 border border-gray-300 rounded-md shadow-sm p-2"
                    style={{ minHeight: "300px", maxHeight: "500px", overflow: "auto" }}
                >
                    <Editor editorState={editorState} onChange={setEditorState} placeholder="Write your post content here..." />
                </div>

                {/* Submit Button */}
                <button type="submit" className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600">
                    {post.id ? 'Update Post' : 'Create Post'}
                </button>
            </form>

            {/* Status Message */}
            {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}

            {isOwner && post.id && (
                <Link href="/admin/blog" className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <ReturnIcon />
                    Return to Main Page
                </Link>
            )}
        </div>
    );
}

// --- Reusable Components ---

const InputField = ({
    label,
    name,
    placeholder,
    value,
    onChange,
    required = false
}: {
    label: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    required?: boolean;
}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type="text"
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required={required}
        />
    </div>
);

const TextFormatButtons = ({ toggleBlockType }: { toggleBlockType: (type: string) => void }) => (
    <div className="mt-2 space-x-2">
        {["header-one", "header-two", "header-three"].map((type, index) => (
            <button
                key={type}
                type="button"
                onClick={() => toggleBlockType(type)}
                className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
            >
                H{index + 1}
            </button>
        ))}
    </div>
);

const ReturnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l7.5-7.5m0 0L18 10.5m-7.5-7.5V21" />
    </svg>
);


