
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/admin/sidebar/app-sidebar";
import { DynamicBreadcrumb } from "@/components/admin/dynamic-breadcrumb";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
   return (
      <SidebarProvider>
         <AppSidebar />
         <SidebarInset >
            <header className="flex justify-between h-12 px-4 border-b">
               <div className="flex gap-2 items-center">
                  <SidebarTrigger />
                  <Separator
                     orientation="vertical"
                     className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <DynamicBreadcrumb />
               </div>
               <Link href="/" className="flex gap-2 text-sm items-center justify-center hover:bg-accent m-2 rounded-md p-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Store</span>
               </Link>
            </header>
            <main>
               {children}
            </main>
         </SidebarInset>
      </SidebarProvider>
   );
}
export default AdminLayout;
