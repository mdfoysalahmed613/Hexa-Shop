"use client";
// Edit profile dialog: updates user profile fields and avatar in Supabase.
// Handles client-side validation and upload constraints (type/size) with feedback.

import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Image from "next/image";
import { DefaultAvatar } from "@/assets/common";
import { Trash2, Upload, UserIcon } from "lucide-react";
import { useUser } from "@/providers/user-provider";

interface FormData {
   fullName: string;
   phone: string;
   avatarUrl: string;
}

export function EditProfileDialog({ user }: { user: User | null }) {
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [formData, setFormData] = useState<FormData>({
      fullName: "",
      phone: "",
      avatarUrl: "",
   });
   const fileInputRef = useRef<HTMLInputElement>(null);

   // Initialize form data from user metadata
   useEffect(() => {
      if (user) {
         setFormData({
            fullName: user.user_metadata?.full_name || "",
            phone: user.user_metadata?.phone || "",
            avatarUrl: user.user_metadata?.avatar_url || "",
         });
      }
   }, [user]);

   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
         toast.error("Please select an image file");
         return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
         toast.error("Image size must be less than 2MB");
         return;
      }

      // Create preview URL immediately for optimistic UI
      const previewUrl = URL.createObjectURL(file);
      const oldAvatarUrl = formData.avatarUrl;

      // Update UI immediately with preview
      setFormData((prev) => ({ ...prev, avatarUrl: previewUrl }));
      setIsUploading(true);

      try {
         const supabase = createClient();
         const fileExt = file.name.split(".").pop();
         const fileName = `avatar-${Date.now()}.${fileExt}`;
         const filePath = `${user.id}/${fileName}`;

         // Delete old avatar if exists
         if (oldAvatarUrl && oldAvatarUrl.includes(user.id)) {
            const urlParts = oldAvatarUrl.split("/");
            const oldFileName = urlParts[urlParts.length - 1];
            if (oldFileName) {
               await supabase.storage.from("avatar").remove([`${user.id}/${oldFileName}`]);
            }
         }

         // Upload new avatar
         const { error: uploadError } = await supabase.storage
            .from("avatar")
            .upload(filePath, file);

         if (uploadError) throw uploadError;

         // Get public URL
         const { data: urlData } = supabase.storage
            .from("avatar")
            .getPublicUrl(filePath);

         // Update user metadata immediately
         const { error: updateError } = await supabase.auth.updateUser({
            data: {
               avatar_url: urlData.publicUrl,
            }
         });

         if (updateError) throw updateError;

         // Clean up preview URL and set real URL
         URL.revokeObjectURL(previewUrl);
         setFormData((prev) => ({ ...prev, avatarUrl: urlData.publicUrl }));
         toast.success("Avatar uploaded successfully");
      } catch (error) {
         console.error(error);
         // Revert to old avatar on error
         URL.revokeObjectURL(previewUrl);
         setFormData((prev) => ({ ...prev, avatarUrl: oldAvatarUrl }));
         toast.error(
            error instanceof Error ? error.message : "Failed to upload avatar"
         );
      } finally {
         setIsUploading(false);
         // Reset input
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
         }
      }
   };

   const handleAvatarDelete = async () => {
      if (!formData.avatarUrl) return;

      setIsUploading(true);
      try {
         const supabase = createClient();
         if (!user) return;

         // Extract file path from URL - the file is stored as "{user_id}/filename"
         const urlParts = formData.avatarUrl.split("/");
         const fileName = urlParts[urlParts.length - 1];

         if (fileName && formData.avatarUrl.includes(user.id)) {
            // Note: files are stored at "{user_id}/filename" path in the bucket
            const { error } = await supabase.storage
               .from("avatar")
               .remove([`${user.id}/${fileName}`]);

            if (error) {
               console.error("Storage delete error:", error);
               // Don't throw - still allow removing the URL from profile
            }
         }

         // Update user metadata immediately
         const { error: updateError } = await supabase.auth.updateUser({
            data: {
               avatar_url: "",
            }
         });

         if (updateError) throw updateError;

         setFormData((prev) => ({ ...prev, avatarUrl: "" }));
         toast.success("Avatar removed");
      } catch (error) {
         console.error(error);
         toast.error(
            error instanceof Error ? error.message : "Failed to remove avatar"
         );
      } finally {
         setIsUploading(false);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;

      setIsLoading(true);

      try {
         const supabase = createClient();

         // Update user metadata instead of profiles table
         const { error } = await supabase.auth.updateUser({
            data: {
               full_name: formData.fullName,
               phone: formData.phone,
               avatar_url: formData.avatarUrl,
            }
         });

         if (error) {
            console.error(error);
            throw error;
         }

         toast.success("Profile updated successfully");
         setIsDialogOpen(false);
      } catch (error) {
         toast.error(
            error instanceof Error ? error.message : "Failed to update profile"
         );
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <>
         <DropdownMenuItem
            onSelect={(e) => {
               e.preventDefault();
               setIsDialogOpen(true);
            }}
         >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
         </DropdownMenuItem>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                     Update your profile information. Changes will be saved to your
                     account.
                  </DialogDescription>
               </DialogHeader>
               <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                     {/* Avatar Section */}
                     <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                           <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-muted">
                              {formData.avatarUrl && formData.avatarUrl.trim() !== "" ? (
                                 <Image
                                    src={formData.avatarUrl}
                                    alt="Avatar"
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <DefaultAvatar size={96} />
                              )}
                           </div>
                           {isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                           )}
                        </div>
                        <div className="flex gap-2">
                           <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                              id="avatar-upload"
                              aria-label="Upload avatar image"
                           />
                           <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isUploading}
                              onClick={() => fileInputRef.current?.click()}
                           >
                              <Upload className="w-4 h-4 mr-2" />
                              {formData.avatarUrl ? "Change" : "Upload"}
                           </Button>
                           {formData.avatarUrl && (
                              <Button
                                 type="button"
                                 variant="outline"
                                 size="sm"
                                 disabled={isUploading}
                                 onClick={handleAvatarDelete}
                              >
                                 <Trash2 className="w-4 h-4 mr-2" />
                                 Remove
                              </Button>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                           Max file size: 2MB. Supported formats: JPG, PNG, GIF
                        </p>
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                           id="email"
                           type="email"
                           value={user?.email || ""}
                           disabled
                           className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                           Email cannot be changed
                        </p>
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                           id="fullName"
                           type="text"
                           placeholder="Enter your full name"
                           value={formData.fullName}
                           onChange={(e) =>
                              setFormData({ ...formData, fullName: e.target.value })
                           }
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                           id="phone"
                           type="tel"
                           placeholder="Optional"
                           value={formData.phone}
                           onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                           }
                        />
                     </div>
                  </div>
                  <DialogFooter>
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isLoading}
                     >
                        Cancel
                     </Button>
                     <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                     </Button>
                  </DialogFooter>
               </form>
            </DialogContent>
         </Dialog>
      </>
   );
}
