import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/admin/sidebar/app-sidebar";

async function AdminGuard() {
   await requireAdmin();
   return null;
}

export default function AdminLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <>
         <Suspense fallback={null}>
            <AdminGuard />
         </Suspense>
         <div className="relative flex h-screen w-full overflow-hidden">
            <SidebarProvider>
               <AppSidebar />
               <SidebarInset className="flex-1">
                  <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                     <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                           orientation="vertical"
                           className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                           <BreadcrumbList>
                              <BreadcrumbItem className="hidden md:block">
                                 <BreadcrumbLink href="/admin">
                                    Admin
                                 </BreadcrumbLink>
                              </BreadcrumbItem>
                              <BreadcrumbSeparator className="hidden md:block" />
                              <BreadcrumbItem>
                                 <BreadcrumbPage>Dashboard</BreadcrumbPage>
                              </BreadcrumbItem>
                           </BreadcrumbList>
                        </Breadcrumb>
                     </div>
                  </header>
                  <main className="flex-1 overflow-y-auto">
                     {children}
                  </main>
               </SidebarInset>
            </SidebarProvider>
         </div>
      </>
   );
}
