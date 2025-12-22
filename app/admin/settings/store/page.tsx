"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
   Store,
   Upload,
   Globe,
   Mail,
   Phone,
   MapPin,
   Save,
   Image as ImageIcon
} from "lucide-react";
import { useState } from "react";

export default function StoreSettingsPage() {
   // Dummy store data - this would come from your database
   const [storeData, setStoreData] = useState({
      name: "Fresh Fashion Store",
      tagline: "Your one-stop shop for trendy fashion",
      description: "We offer the latest fashion trends at affordable prices. Quality clothing for everyone.",
      email: "contact@freshfashion.com",
      phone: "+1 (555) 123-4567",
      address: "123 Fashion Street, Style City, SC 12345",
      website: "https://freshfashion.com",
      currency: "USD",
      timezone: "America/New_York",
      // Social media
      facebook: "https://facebook.com/freshfashion",
      instagram: "https://instagram.com/freshfashion",
      twitter: "https://twitter.com/freshfashion",
   });

   const handleInputChange = (field: string, value: string) => {
      setStoreData(prev => ({ ...prev, [field]: value }));
   };

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
               <p className="text-muted-foreground">
                  Configure your store&apos;s identity and contact information
               </p>
            </div>
            <Button>
               <Save className="mr-2 h-4 w-4" />
               Save Changes
            </Button>
         </div>

         <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Store Info - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
               {/* Basic Information */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Basic Information
                     </CardTitle>
                     <CardDescription>
                        Your store&apos;s name and description as shown to customers
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Store Name *</Label>
                        <Input
                           id="name"
                           value={storeData.name}
                           onChange={(e) => handleInputChange("name", e.target.value)}
                           placeholder="Enter your store name"
                        />
                        <p className="text-xs text-muted-foreground">
                           This is displayed in the browser tab and search results
                        </p>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                           id="tagline"
                           value={storeData.tagline}
                           onChange={(e) => handleInputChange("tagline", e.target.value)}
                           placeholder="A short catchy phrase"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Store Description</Label>
                        <Textarea
                           id="description"
                           value={storeData.description}
                           onChange={(e) => handleInputChange("description", e.target.value)}
                           placeholder="Tell customers about your store"
                           rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                           Used for SEO and about page content
                        </p>
                     </div>
                  </CardContent>
               </Card>

               {/* Contact Information */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Contact Information
                     </CardTitle>
                     <CardDescription>
                        How customers can reach you
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                           <Label htmlFor="email">Contact Email *</Label>
                           <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                 id="email"
                                 type="email"
                                 value={storeData.email}
                                 onChange={(e) => handleInputChange("email", e.target.value)}
                                 className="pl-10"
                                 placeholder="contact@example.com"
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="phone">Phone Number</Label>
                           <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                 id="phone"
                                 type="tel"
                                 value={storeData.phone}
                                 onChange={(e) => handleInputChange("phone", e.target.value)}
                                 className="pl-10"
                                 placeholder="+1 (555) 000-0000"
                              />
                           </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <div className="relative">
                           <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                           <Textarea
                              id="address"
                              value={storeData.address}
                              onChange={(e) => handleInputChange("address", e.target.value)}
                              className="pl-10"
                              placeholder="Enter your business address"
                              rows={2}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="website">Website URL</Label>
                        <div className="relative">
                           <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input
                              id="website"
                              type="url"
                              value={storeData.website}
                              onChange={(e) => handleInputChange("website", e.target.value)}
                              className="pl-10"
                              placeholder="https://yourstore.com"
                           />
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Social Media */}
               <Card>
                  <CardHeader>
                     <CardTitle>Social Media Links</CardTitle>
                     <CardDescription>
                        Connect your social media accounts
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                           <Label htmlFor="facebook">Facebook</Label>
                           <Input
                              id="facebook"
                              value={storeData.facebook}
                              onChange={(e) => handleInputChange("facebook", e.target.value)}
                              placeholder="https://facebook.com/yourpage"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="instagram">Instagram</Label>
                           <Input
                              id="instagram"
                              value={storeData.instagram}
                              onChange={(e) => handleInputChange("instagram", e.target.value)}
                              placeholder="https://instagram.com/yourhandle"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="twitter">Twitter / X</Label>
                           <Input
                              id="twitter"
                              value={storeData.twitter}
                              onChange={(e) => handleInputChange("twitter", e.target.value)}
                              placeholder="https://twitter.com/yourhandle"
                           />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Sidebar - Branding */}
            <div className="space-y-6">
               {/* Logo Upload */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Store Logo
                     </CardTitle>
                     <CardDescription>
                        Your logo appears in the header and emails
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                           <Store className="h-10 w-10 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                           Drag and drop or click to upload
                        </p>
                        <Button variant="outline" size="sm">
                           <Upload className="mr-2 h-4 w-4" />
                           Upload Logo
                        </Button>
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Recommended: 512x512px, PNG or SVG
                     </p>
                  </CardContent>
               </Card>

               {/* Favicon Upload */}
               <Card>
                  <CardHeader>
                     <CardTitle>Favicon</CardTitle>
                     <CardDescription>
                        The small icon shown in browser tabs
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded bg-secondary flex items-center justify-center mb-3">
                           <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <Button variant="outline" size="sm">
                           <Upload className="mr-2 h-4 w-4" />
                           Upload Favicon
                        </Button>
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Recommended: 32x32px, ICO or PNG
                     </p>
                  </CardContent>
               </Card>

               {/* Regional Settings */}
               <Card>
                  <CardHeader>
                     <CardTitle>Regional Settings</CardTitle>
                     <CardDescription>
                        Currency and timezone preferences
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                           id="currency"
                           className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                           value={storeData.currency}
                           onChange={(e) => handleInputChange("currency", e.target.value)}
                        >
                           <option value="USD">USD - US Dollar ($)</option>
                           <option value="EUR">EUR - Euro (€)</option>
                           <option value="GBP">GBP - British Pound (£)</option>
                           <option value="JPY">JPY - Japanese Yen (¥)</option>
                           <option value="CAD">CAD - Canadian Dollar (C$)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                           id="timezone"
                           className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                           value={storeData.timezone}
                           onChange={(e) => handleInputChange("timezone", e.target.value)}
                        >
                           <option value="America/New_York">Eastern Time (ET)</option>
                           <option value="America/Chicago">Central Time (CT)</option>
                           <option value="America/Denver">Mountain Time (MT)</option>
                           <option value="America/Los_Angeles">Pacific Time (PT)</option>
                           <option value="Europe/London">London (GMT)</option>
                           <option value="Europe/Paris">Paris (CET)</option>
                        </select>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}