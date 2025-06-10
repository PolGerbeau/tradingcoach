"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClientComponentClient();

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/upload");
      } else {
        // Esperamos un poco y reintentamos
        setTimeout(async () => {
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();

          if (retrySession) {
            router.push("/upload");
          } else {
            router.push("/login");
          }
        }, 1000); // Reintenta en 1s
      }
    };

    checkSession();
  }, [router]);

  return <p className="text-center mt-20">Signin in...</p>;
}
