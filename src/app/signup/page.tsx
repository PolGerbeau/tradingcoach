"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event, "Session:", !!session);
        if (event === "SIGNED_IN") {
          router.push("/dashboard");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
            Error
          </h1>
          <p className="text-sm text-gray-600 text-center">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Sign Up
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Create an account with your email and password.
        </p>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#3b82f6",
                  brandAccent: "#2563eb",
                },
              },
            },
          }}
          providers={[]}
          view="sign_up"
          showLinks={true}
          redirectTo={`${
            typeof window !== "undefined"
              ? window.location.origin
              : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/auth/callback`}
        />
      </div>
    </main>
  );
}
