"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
   user: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
   const supabase = createClient();
   const [user, setUser] = useState<User | null>(null);

   useEffect(() => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
         if (event === 'SIGNED_OUT') {
            setUser(null);
         } else if (session) {
            // If any other event (SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED) occurs
            // The subscription returns the latest session, but we also expose refreshUser
            setUser(session?.user ?? null);
         }
      });

      return () => {
         subscription.unsubscribe();
      };
   }, []);

   return (
      <UserContext.Provider value={{ user }}>
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
