"use client";

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

   return (
      <Avatar className={className}>
         <AvatarImage
            src={user.user_metadata?.avatar_url}
            alt={user.user_metadata?.full_name || user.email || "User"}
         />
         <AvatarFallback className={fallbackClassName}>
            {getUserInitials(user)}
         </AvatarFallback>
      </Avatar>
   );
}
