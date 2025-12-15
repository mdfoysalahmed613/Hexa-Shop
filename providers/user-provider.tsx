"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
   user: User | null;
   isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
   const supabase = createClient();
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const checkInitialSession = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         setUser(user);
         setIsLoading(false); // <--- Set loading to false AFTER initial check
      };
      checkInitialSession();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
         if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsLoading(false);
         } else if (session) {
            // If any other event (SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED) occurs
            // The subscription returns the latest session, but we also expose refreshUser
            setUser(session?.user ?? null);
            setIsLoading(false);
         }
      });

      return () => {
         subscription.unsubscribe();
      };
   }, []);

   return (
      <UserContext.Provider value={{ user, isLoading }}>
         {children}
      </UserContext.Provider>
   );
}

export function useUser() {
   const context = useContext(UserContext);
   if (context === undefined) {
      throw new Error("useUser must be used within a UserProvider");
   }
   return context;
}
