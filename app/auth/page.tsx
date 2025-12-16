import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function AuthPage() {
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
