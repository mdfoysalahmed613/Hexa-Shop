"use client";

import { useEffect, useState } from "react";
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

interface EditProfileDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   user: User;
   onUpdate: () => void;
}

export function EditProfileDialog({ open, onOpenChange, user, onUpdate }: EditProfileDialogProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [formData, setFormData] = useState({
      fullName: user.user_metadata?.full_name || "",
      phone: "",
      avatarUrl: user.user_metadata?.avatar_url || "",
      age: "",
      gender: "",
   });

   useEffect(() => {
      if (!open) return;

      const loadProfile = async () => {
         const supabase = createClient();
         const { data, error } = await supabase
            .from("profiles")
            .select("name, photo_url, phone, age, gender")
            .eq("id", user.id)
            .single();

         if (error) {
            console.error(error);
            return;
         }

         if (data) {
            setFormData({
               fullName: data.name || user.user_metadata?.full_name || "",
               phone: data.phone || "",
               avatarUrl: data.photo_url || user.user_metadata?.avatar_url || "",
               age: data.age?.toString() || "",
               gender: data.gender || "",
            });
         }
      };

      void loadProfile();
   }, [open, user.id, user.user_metadata?.avatar_url, user.user_metadata?.full_name]);

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
         onUpdate();
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
                  <div className="grid gap-2">
                     <Label htmlFor="age">Age</Label>
                     <Input
                        id="age"
                        type="number"
                        min={0}
                        max={120}
                        placeholder="Optional"
                        value={formData.age}
                        onChange={(e) =>
                           setFormData({ ...formData, age: e.target.value })
                        }
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="gender">Gender</Label>
                     <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                           setFormData({ ...formData, gender: value })
                        }
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Prefer not to say" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="male">Male</SelectItem>
                           <SelectItem value="female">Female</SelectItem>
                           <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="avatarUrl">Avatar URL</Label>
                     <Input
                        id="avatarUrl"
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={formData.avatarUrl}
                        onChange={(e) =>
                           setFormData({ ...formData, avatarUrl: e.target.value })
                        }
                     />
                     <p className="text-xs text-muted-foreground">
                        Enter a URL for your profile picture
                     </p>
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
