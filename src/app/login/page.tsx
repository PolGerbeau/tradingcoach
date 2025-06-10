"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster, toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) return toast.error("Please enter your email.");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for the magic link.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200">
      <Toaster position="top-center" />
      <Card className="w-full max-w-md shadow-xl rounded-2xl p-6 bg-white">
        <CardContent>
          <h1 className="text-2xl font-bold text-center text-blue-800 mb-4">
            Login to TradingCoach
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your email and we’ll send you a magic link to sign in.
          </p>

          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
