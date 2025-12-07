"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
   user: User | null;
   isLoading: boolean;
   refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const supabase = createClient();

   const fetchUser = async () => {
      try {
         const {
            data: { user },
         } = await supabase.auth.getUser();
         setUser(user);
      } catch (error) {
         console.error("Error fetching user:", error);
         setUser(null);
      } finally {
         setIsLoading(false);
      }
   };
   console.log("UserProvider render, current user:", user);

   useEffect(() => {
      let mounted = true;

      const initAuth = async () => {
         if (mounted) {
            await fetchUser();
         }
      };

      initAuth();

      const {
         data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
         if (mounted) {
            setUser(session?.user ?? null);
            setIsLoading(false);
         }
      });

      return () => {
         mounted = false;
         subscription.unsubscribe();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <UserContext value={{ user, isLoading, refreshUser: fetchUser }}>
         {children}
      </UserContext>
   );
}

export function useUser() {
   const context = useContext(UserContext);
   if (context === undefined) {
      throw new Error("useUser must be used within a UserProvider");
   }
   return context;
}
