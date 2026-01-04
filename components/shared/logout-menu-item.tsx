"use client";

/**
 * Logout Menu Item
 *
 * Dropdown menu item that signs out the current user.
 * Triggers Supabase auth signOut and refreshes the page.
 */

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function LogoutMenuItem() {
   const supabase = createClient();
   const router = useRouter();

   const handleLogout = async () => {
      await supabase.auth.signOut();
      router.refresh();
   };

   return (
      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
         <LogOut className="mr-2 h-4 w-4" />
         <span>Log out</span>
      </DropdownMenuItem>
   );
}
