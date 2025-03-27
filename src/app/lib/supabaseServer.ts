import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function supabaseServer() {
    const cookiesStore = await cookies();
    const authToken = cookiesStore.get("authToken")?.value;

    return createClient(

        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            global: {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            },
        }
    );
}
