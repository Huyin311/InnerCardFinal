import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  return userId;
}
