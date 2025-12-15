"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import {
   Shield,
   User,
} from "lucide-react";
import { useState } from "react";
import { isAdmin } from "@/lib/auth/roles";
import { useUser } from "@/providers/user-provider";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProfileDialog } from "./edit-profile-dialog";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LogoutMenuItem } from "@/components/ui/logout-menu-item";
import { Skeleton } from "../ui/skeleton";

export default function AuthButton() {
   const { user, isLoading } = useUser();
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   if (isLoading) {
      return <Skeleton className="h-8 w-8 rounded-full" />;
   }
   if (!user) {
      return (
         <Button asChild>
            <Link href="/auth">
               Login
               <span className="sr-only">Login</span>
            </Link>
         </Button>
      );
   }
   return (
      <>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="rounded-full">
                  <UserAvatar user={user} />
                  <span className="sr-only">User menu</span>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
               <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                     <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || "User"}
                     </p>
                     <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                     </p>
                     {isAdmin(user) && (
                        <p className="text-xs text-primary font-medium">Admin</p>
                     )}
                  </div>
               </DropdownMenuLabel>
               <DropdownMenuSeparator />
               {isAdmin(user) && (
                  <DropdownMenuItem asChild>
                     <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                     </Link>
                  </DropdownMenuItem>
               )}
            
               <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
               </DropdownMenuItem>
               <ThemeSwitcher />
               <DropdownMenuSeparator />
               <LogoutMenuItem />
            </DropdownMenuContent>
         </DropdownMenu>

         <EditProfileDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            user={user}
         />
      </>
   );
}


