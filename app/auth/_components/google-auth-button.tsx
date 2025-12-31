"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

type GoogleAuthButtonProps = {
   onError?: (message: string) => void;
};

export function GoogleAuthButton({ onError }: GoogleAuthButtonProps) {
   const [isLoading, setIsLoading] = useState(false);
   const searchParams = useSearchParams();
   const redirect = searchParams.get("redirect") || "/";

   const handleGoogleLogin = async () => {
      const supabase = createClient();
      setIsLoading(true);
      try {
         const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
               redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
            },
         });
         if (error) throw error;
      } catch (e) {
         const message = e instanceof Error ? e.message : "An error occurred";
         onError?.(message);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Button
         variant="outline"
         type="button"
         className="w-full gap-2"
         onClick={handleGoogleLogin}
         disabled={isLoading}
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 48 48"
            aria-hidden="true"
            focusable="false"
         >
            <path
               fill="#FFC107"
               d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.98 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
               fill="#FF3D00"
               d="M6.306 14.691l6.571 4.819C14.655 16.108 19.009 14 24 14c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.98 4 24 4c-7.682 0-14.33 4.337-17.694 10.691z"
            />
            <path
               fill="#4CAF50"
               d="M24 44c4.915 0 9.49-1.875 12.928-4.928l-5.972-5.059C29.91 35.457 27.149 36.6 24 36.6c-5.187 0-9.6-3.493-11.207-8.271l-6.531 5.047C9.586 40.104 16.29 44 24 44z"
            />
            <path
               fill="#1976D2"
               d="M43.611 20.083H42V20H24v8h11.303c-.793 2.237-2.244 4.166-4.075 5.556l5.972 5.059C36.843 39.168 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
         </svg>
         {isLoading ? "Signing in with Google..." : "Continue with Google"}
      </Button>
   );
}

export default GoogleAuthButton;
