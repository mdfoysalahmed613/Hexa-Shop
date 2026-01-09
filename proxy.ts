// Next.js middleware entry: delegates to Supabase proxy for session refresh.
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    //  Match all request paths except /admin path.
    "/admin/:path*",
  ],
};
