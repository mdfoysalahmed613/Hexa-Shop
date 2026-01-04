"use client";

/**
 * User Avatar
 *
 * Displays user's avatar image with fallback to initials.
 * Extracts initials from full name or email when no avatar is set.
 */

import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
   user: User;
   className?: string;
   fallbackClassName?: string;
}

export function UserAvatar({
   user,
   className = "h-8 w-8",
   fallbackClassName = "",
}: UserAvatarProps) {
   const getUserInitials = (user: User) => {
      const name = user.user_metadata?.full_name || user.email || "";
      return name
         .split(" ")
         .map((n: string) => n[0])
         .join("")
         .toUpperCase()
         .slice(0, 2);
   };

   const avatarUrl = user.user_metadata?.avatar_url;
   const hasValidAvatar = avatarUrl && avatarUrl.trim() !== "";

   return (
      <Avatar className={className}>
         {hasValidAvatar && (
            <AvatarImage
               src={avatarUrl}
               alt={user.user_metadata?.full_name || user.email || "User"}
            />
         )}
         <AvatarFallback className={fallbackClassName}>
            {getUserInitials(user)}
         </AvatarFallback>
      </Avatar>
   );
}
