"use client";

import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

interface BulkActionsProps {
   draftCount: number;
   isSubmitting: boolean;
   onPublishAllDraft: () => Promise<void>;
   onHideEmpty: () => Promise<void>;
   onDeleteEmpty: () => Promise<void>;
}

export function BulkActions({
   draftCount,
   isSubmitting,
   onPublishAllDraft,
   onHideEmpty,
   onDeleteEmpty,
}: BulkActionsProps) {
   const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

   const handleDeleteEmpty = async () => {
      await onDeleteEmpty();
      setIsBulkDeleteDialogOpen(false);
   };

   return (
      <>
         <Card>
            <CardHeader>
               <CardTitle>Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onPublishAllDraft}
                  disabled={isSubmitting || draftCount === 0}
               >
                  {isSubmitting ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                     <Eye className="mr-2 h-4 w-4" />
                  )}
                  Publish All Draft ({draftCount})
               </Button>
               <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onHideEmpty}
                  disabled={isSubmitting}
               >
                  {isSubmitting ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                     <EyeOff className="mr-2 h-4 w-4" />
                  )}
                  Hide Empty Categories
               </Button>
               <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  disabled={isSubmitting}
               >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Empty Categories
               </Button>
            </CardContent>
         </Card>

         <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete Empty Categories</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete all categories with 0 products? This action cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleDeleteEmpty}
                     disabled={isSubmitting}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Deleting...
                        </>
                     ) : (
                        "Delete All Empty"
                     )}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
