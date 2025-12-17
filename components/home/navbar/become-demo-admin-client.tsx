'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { ShieldQuestionMark } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useUser } from '@/providers/user-provider';
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
} from '@/components/ui/alert-dialog';

interface BecomeDemoAdminClientProps {
   onBecomeDemoAdmin: () => Promise<{ ok: boolean; error?: string }>;
}

const BecomeDemoAdminClient = ({ onBecomeDemoAdmin }: BecomeDemoAdminClientProps) => {
   const router = useRouter();
   const { refreshUser } = useUser();
   const [isLoading, setIsLoading] = useState(false);
   const [isOpen, setIsOpen] = useState(false);

   const handleConfirm = async () => {
      setIsLoading(true);
      try {
         const result = await onBecomeDemoAdmin();

         if (!result.ok) {
            toast.error(result.error || 'Failed to become demo admin');
            return;
         }

         // Refresh the user session to get updated app_metadata with new role
         await refreshUser();
         toast.success('Demo admin enabled!');
         setIsOpen(false);

         // Small delay to show toast, then redirect
         setTimeout(() => {
            router.push('/admin');
            router.refresh();
         }, 500);
      } catch (e) {
         const msg = e instanceof Error ? e.message : 'An error occurred';
         toast.error(msg);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
         <AlertDialogTrigger asChild>
            <DropdownMenuItem
               onSelect={(e) => {
                  e.preventDefault();
                  setIsOpen(true);
               }}
            >
               <ShieldQuestionMark className="mr-2 h-4 w-4" />
               <span>Become Demo Admin</span>
            </DropdownMenuItem>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Enable Demo Admin Access?</AlertDialogTitle>
               <AlertDialogDescription>
                  This will grant you temporary admin access to explore the admin dashboard.
                  You&apos;ll be able to view and test admin features without affecting real data.
                  This change will update your account role to &quot;demo_admin&quot;.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
               <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
                  {isLoading ? 'Enabling...' : 'Continue'}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

export default BecomeDemoAdminClient;
