"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/profile");
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  return <p className="text-center mt-20">Signing in...</p>;
}
