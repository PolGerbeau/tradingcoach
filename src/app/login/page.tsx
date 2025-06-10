"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/upload"); // Redirect to dashboard after login
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Sign In
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email to receive a magic link.
        </p>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#3b82f6", // Tailwind blue-500
                  brandAccent: "#2563eb", // Tailwind blue-600
                },
              },
            },
          }}
          providers={[]}
          view="magic_link"
          showLinks={false}
          redirectTo={`${
            typeof window !== "undefined" ? window.location.origin : ""
          }/auth/callback`}
        />
      </div>
    </main>
  );
}
