"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import {
   DropdownMenuSub,
   DropdownMenuSubTrigger,
   DropdownMenuSubContent,
   DropdownMenuPortal,
   DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
   const { setTheme } = useTheme();

   return (
      <DropdownMenuSub>
         <DropdownMenuSubTrigger>
            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 scale-0 dark:scale-100" />
            <span>Theme</span>
         </DropdownMenuSubTrigger>
         <DropdownMenuPortal>
            <DropdownMenuSubContent>
               <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>System</span>
               </DropdownMenuItem>
            </DropdownMenuSubContent>
         </DropdownMenuPortal>
      </DropdownMenuSub>
   );
}
