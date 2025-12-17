"use client";
// Edit profile dialog: updates user profile fields and avatar in Supabase.
// Handles client-side validation and upload constraints (type/size) with feedback.

import { useEffect, useRef, useState } from "react";
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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { DefaultAvatar } from "@/assets/common";
import { Trash2, Upload } from "lucide-react";

interface EditProfileDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   user: User;
}

export function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [formData, setFormData] = useState({
      fullName: "",
      phone: "",
      avatarUrl: "",
      age: "",
      gender: "",
   });

   useEffect(() => {
      if (!open) return;

      let isMounted = true;

      const loadProfile = async () => {
         const supabase = createClient();
         const { data, error } = await supabase
            .from("profiles")
            .select("name, photo_url, phone, age, gender")
            .eq("id", user.id)
            .single();

         if (!isMounted) return;

         if (error) {
            console.error(error);
            toast.error("Failed to load profile data");
            return;
         }

         if (data) {
            setFormData({
               fullName: data.name || "",
               phone: data.phone || "",
               avatarUrl: data.photo_url || "",
               age: data.age?.toString() || "",
               gender: data.gender || "",
            });
         }
      };

      void loadProfile();

      return () => {
         isMounted = false;
      };
   }, [open, user.id]);

   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

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

      setIsUploading(true);
      try {
         const supabase = createClient();
         const fileExt = file.name.split(".").pop();
         const fileName = `${user.id}-${Date.now()}.${fileExt}`;
         const filePath = `avatars/${fileName}`;

         // Delete old avatar if exists
         if (formData.avatarUrl) {
            const oldPath = formData.avatarUrl.split("/").pop();
            if (oldPath) {
               await supabase.storage.from("avatars").remove([`avatars/${oldPath}`]);
            }
         }

         // Upload new avatar
         const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file);

         if (uploadError) throw uploadError;

         // Get public URL
         const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

         setFormData((prev) => ({ ...prev, avatarUrl: urlData.publicUrl }));
         toast.success("Avatar uploaded successfully");
      } catch (error) {
         console.error(error);
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
         // Extract file path from URL - the file is stored as "avatars/filename"
         const urlParts = formData.avatarUrl.split("/");
         const fileName = urlParts[urlParts.length - 1];

         if (fileName && formData.avatarUrl.includes("avatars")) {
            // Note: files are stored at "avatars/filename" path in the bucket
            const { error } = await supabase.storage
               .from("avatars")
               .remove([`avatars/${fileName}`]);

            if (error) {
               console.error("Storage delete error:", error);
               // Don't throw - still allow removing the URL from profile
            }
         }

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
      setIsLoading(true);

      try {
         const supabase = createClient();
         const ageValue = formData.age ? Number(formData.age) : null;
         const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            name: formData.fullName,
            photo_url: formData.avatarUrl,
            phone: formData.phone,
            age: Number.isNaN(ageValue) ? null : ageValue,
            gender: formData.gender || null,
         });

         if (error) {
            console.error(error);
            throw error;
         }
         toast.success("Profile updated successfully");
         onOpenChange(false);
      } catch (error) {
         toast.error(
            error instanceof Error ? error.message : "Failed to update profile"
         );
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
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
                           {formData.avatarUrl ? (
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
                        value={user.email || ""}
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
                  <div className="flex gap-2">
                     <div className="grid gap-2 w-full">
                        <Label htmlFor="age">Age</Label>
                        <Input
                           id="age"
                           type="number"
                           min={10}
                           max={120}
                           placeholder="Optional"
                           value={formData.age}
                           onChange={(e) =>
                              setFormData({ ...formData, age: e.target.value })
                           }
                        />

                     </div>
                     <div className="grid gap-2 w-full">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                           value={formData.gender}
                           onValueChange={(value) =>
                              setFormData({ ...formData, gender: value })
                           }
                        >
                           <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select gender" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               </div>
               <DialogFooter>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => onOpenChange(false)}
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
   );
}
