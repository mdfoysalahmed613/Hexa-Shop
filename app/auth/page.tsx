import { LoginForm } from "./_components/login-form";
import { SignUpForm } from "./_components/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface AuthPageProps {
   searchParams: Promise<{ demo?: string; redirect?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
   const params = await searchParams;
   const isDemo = params.demo === "true";

   return (
      <div className="relative flex bg-sidebar min-h-svh w-full items-center justify-center p-4 md:p-6">
         <div className="absolute left-4 top-4 md:left-8 md:top-8">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
               <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back
               </Link>
            </Button>
         </div>
         <div className="w-full max-w-sm">
            {/* Demo admin info banner */}
            {isDemo && (
               <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                     <p className="font-medium text-foreground">Trying the Admin Demo?</p>
                     <p className="text-muted-foreground mt-1">
                        Login or create an account, then click &quot;Become Demo Admin&quot; to
                        access the admin dashboard.
                     </p>
                  </div>
               </div>
            )}
            <Tabs defaultValue="login" >
               <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
               </TabsList>
               <TabsContent value="login" className="mt-6">
                  <Suspense><LoginForm /></Suspense>

               </TabsContent>
               <TabsContent value="register" className="mt-6">
                  <SignUpForm />
               </TabsContent>
            </Tabs>
         </div>
      </div>
   );
}
