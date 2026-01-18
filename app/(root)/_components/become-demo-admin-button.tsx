"use client";

/**
 * Become Demo Admin Button
 *
 * Standalone button component for the landing page banner.
 * Opens a confirmation dialog and grants demo_admin role.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/providers/user-provider";
import { becomeDemoAdmin } from "@/app/(root)/_actions/demo-admin";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BecomeDemoAdminButton() {
   const router = useRouter();
   const { refreshUser } = useUser();
   const [isLoading, setIsLoading] = useState(false);
   const [isOpen, setIsOpen] = useState(false);

   const handleConfirm = async () => {
      setIsLoading(true);
      try {
         const result = await becomeDemoAdmin();

         if (!result.ok) {
            toast.error(result.error || "Failed to become demo admin");
            return;
         }

         await refreshUser();
         toast.success("Demo admin enabled! Redirecting to admin panel...");
         setIsOpen(false);

         setTimeout(() => {
            router.push("/admin");
            router.refresh();
         }, 500);
      } catch (e) {
         const msg = e instanceof Error ? e.message : "An error occurred";
         toast.error(msg);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
         <AlertDialogTrigger asChild>
            <Button size="lg">
               <Shield className="mr-2 h-4 w-4" />
               Try Admin Demo
               <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Enable Demo Admin Access?</AlertDialogTitle>
               <AlertDialogDescription>
                  This will grant you temporary admin access to explore the admin dashboard.
                  You&apos;ll be able to view and test admin features. As a demo admin, you
                  can create and update records but cannot delete anything.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
               <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
                  {isLoading ? "Enabling..." : "Continue"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
