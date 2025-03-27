import { NextResponse } from "next/server";
import { getAuthUserFromToken } from "@/app/lib/auth";

export async function GET(req: Request) {
    const userId = await getAuthUserFromToken(req);

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized: No valid token" }, { status: 401 });
    }

    return NextResponse.json({ message: "Protected data", userId }, { status: 200 });
}

