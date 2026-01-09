/**
 * Admin Loading Page
 *
 * Displays immediately when navigating to admin routes.
 * Shows a loading skeleton while middleware auth check runs.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminLoading() {
   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header skeleton */}
         <div className="flex items-center justify-between">
            <div className="space-y-2">
               <Skeleton className="h-8 w-48" />
               <Skeleton className="h-4 w-64" />
            </div>
         </div>

         {/* Stats cards skeleton */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
               <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <Skeleton className="h-4 w-24" />
                     <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                     <Skeleton className="h-8 w-20 mb-1" />
                     <Skeleton className="h-3 w-32" />
                  </CardContent>
               </Card>
            ))}
         </div>

         {/* Content skeleton */}
         <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1">
               <CardHeader>
                  <Skeleton className="h-5 w-32" />
               </CardHeader>
               <CardContent className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                     </div>
                  ))}
               </CardContent>
            </Card>
            <Card className="md:col-span-1">
               <CardHeader>
                  <Skeleton className="h-5 w-32" />
               </CardHeader>
               <CardContent className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-4 w-40" />
                           <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                     </div>
                  ))}
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
