"use client"
import React, { useState } from 'react'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSkeleton,
   useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVertical, User } from 'lucide-react'
import { useUser } from '@/providers/user-provider'
import { EditProfileDialog } from '@/components/auth/edit-profile-dialog'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { UserAvatar } from '@/components/ui/user-avatar'
import { LogoutMenuItem } from '@/components/ui/logout-menu-item'

const FooterUser = () => {
   const [isDialogOpen, setIsDialogOpen] = useState(false)
   const { isMobile } = useSidebar()
   const { user, refreshUser, isLoading } = useUser();

   if (isLoading) {
      return (
         <SidebarMenu>
            <SidebarMenuItem>
               <SidebarMenuSkeleton className="px-3 py-6" />
            </SidebarMenuItem>
         </SidebarMenu>
      )
   }

   if (!user) return null;
   return (
      <>
         <SidebarMenu>
            <SidebarMenuItem>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild >
                     <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                     >
                        <UserAvatar
                           user={user}
                           className="rounded-lg"
                           fallbackClassName="rounded-lg"
                        />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                           <span className="truncate font-medium">{user.user_metadata?.full_name}</span>
                           <span className="text-muted-foreground truncate text-xs">
                              {user.email}
                           </span>
                        </div>
                        <EllipsisVertical className="ml-auto size-4" />
                     </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                     className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                     side={isMobile ? "bottom" : "right"}
                     align="end"
                     sideOffset={4}
                  >
                     <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                           <UserAvatar
                              user={user}
                              className="h-8 w-8 rounded-lg"
                              fallbackClassName="rounded-lg"
                           />
                           <div className="grid flex-1 text-left text-sm leading-tight">
                              <span className="truncate font-medium">{user.user_metadata?.full_name}</span>
                              <span className="text-muted-foreground truncate text-xs">
                                 {user.email}
                              </span>
                           </div>
                        </div>
                     </DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                           <User className='mr-2' />
                           Edit Profile
                        </DropdownMenuItem>
                        <ThemeSwitcher />
                     </DropdownMenuGroup>
                     <DropdownMenuSeparator />
                     <LogoutMenuItem />
                  </DropdownMenuContent>
               </DropdownMenu>
            </SidebarMenuItem>
         </SidebarMenu>

         <EditProfileDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            user={user}
            onUpdate={refreshUser}
         />
      </>
   )
}

export default FooterUser