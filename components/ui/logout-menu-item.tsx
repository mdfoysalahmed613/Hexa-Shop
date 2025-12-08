"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LogoutMenuItem() {
   const supabase = createClient();
   const router = useRouter();

   const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push("/auth");
   };

   return (
      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
         <LogOut className="mr-2 h-4 w-4" />
         <span>Log out</span>
      </DropdownMenuItem>
   );
}
