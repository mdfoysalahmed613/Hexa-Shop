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

   /**
    * Manually refresh the user session to get updated metadata.
    * Useful when app_metadata changes on the server (e.g., role updates).
    */
   const refreshUser = async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (!error && session) {
         setUser(session.user);
      }
   };

   useEffect(() => {
      const supabase = createClient();

      // Bootstrap with the current session on mount
      const checkInitialSession = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         setUser(user);
         setIsLoading(false);
      };
      checkInitialSession();

      // Listen for auth state changes (sign-in/out, token refresh, user update)
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
         // Cleanup subscription on unmount
         subscription.unsubscribe();
      };
   }, []);

   return (
      <UserContext value={{ user, isLoading, refreshUser }}>
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
