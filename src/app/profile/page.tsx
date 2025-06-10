import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const user = session.user;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">Welcome!</h1>
        <p className="text-gray-700 mb-4">You are logged in as:</p>
        <p className="text-gray-900 font-medium mb-8">{user.email}</p>

        <form action="/auth/logout" method="post">
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
            Logout
          </Button>
        </form>
      </div>
    </main>
  );
}
