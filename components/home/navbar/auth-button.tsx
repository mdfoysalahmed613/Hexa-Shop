"use client";
import Link from "next/link";
import { useState } from "react";
import { Shield, User } from "lucide-react";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
   DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { UserAvatar } from "@/components/home/navbar/user-avatar";
import { LogoutMenuItem } from "@/components/home/navbar/logout-menu-item";
import { EditProfileDialog } from "../../auth/edit-profile-dialog";
import { hasAdminAccess, isAdmin, isDemoAdmin } from "@/lib/auth/roles";
import { useUser } from "@/providers/user-provider";
import BecomeDemoAdminClient from "./become-demo-admin-client";
import { becomeDemoAdmin } from "@/app/actions/demo-admin";

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
                     {/* Role indicator: show Admin or Demo Admin if applicable */}
                     {isAdmin(user) && (
                        <p className="text-xs text-primary font-medium">Admin</p>
                     )}
                     {isDemoAdmin(user) && (
                        <p className="text-xs text-primary font-medium">Demo Admin</p>
                     )}
                  </div>
               </DropdownMenuLabel>
               <DropdownMenuSeparator />
               {hasAdminAccess(user) && (
                  <DropdownMenuItem asChild>
                     <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                     </Link>
                  </DropdownMenuItem>
               )}

               {/* Become Demo Admin - client component with server action */}
               {!hasAdminAccess(user) && <BecomeDemoAdminClient onBecomeDemoAdmin={becomeDemoAdmin} />}

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


