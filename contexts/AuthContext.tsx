import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

export interface UserInfo {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  [key: string]: any;
}
interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
}
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();
        setUser({ ...data.user, ...profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
