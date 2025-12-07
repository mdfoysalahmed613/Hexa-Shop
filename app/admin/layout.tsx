
import AppSidebar from '@/components/admin/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { requireAdmin } from '@/lib/auth/admin-guard'
import React from 'react'

const layout = async ({ children }: { children: React.ReactNode }) => {
   await requireAdmin()

   return (
      <SidebarProvider >
         <AppSidebar />
         <SidebarInset>
            <SidebarTrigger />
            {children}
         </SidebarInset>
      </SidebarProvider>

   )
}

export default layout