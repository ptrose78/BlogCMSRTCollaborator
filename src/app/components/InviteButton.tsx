"use client"

import { useState } from "react";

export default function InviteButton ({initialPost}: {initialPost: any}) {
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState("");

        // Function to send an invite
        const sendInvite = async () => {
            if (!inviteEmail) {
                setInviteStatus("Please enter an email address.");
                return;
            }
    
            const response = await fetch("/api/send-invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: inviteEmail,
                    postId: initialPost?.id, // Send post ID for tracking
                }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                setInviteStatus("Invitation sent successfully!");
                setInviteEmail("");
                setShowInviteForm(false);
            } else {
                setInviteStatus("Failed to send invitation.");
            }
        };

    return (
        <>
            <button type="button" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mt-4"  onClick={() => setShowInviteForm(!showInviteForm)}>
                Invite
            </button>

            {/* Invite Form (Shown when button is clicked) */}
            {showInviteForm && (
                <div className="mt-4 p-4 border rounded-md shadow">
                    <h3 className="text-lg font-semibold">Invite a Collaborator</h3>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full border p-2 mt-2 rounded"
                    />
                    <button
                        onClick={sendInvite}
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                        Send Invite
                    </button>
                    {inviteStatus && <p className="mt-2 text-sm">{inviteStatus}</p>}
                </div>
            )}
        </>
    )
};