import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          // No podemos modificar cookies en Server Components
          // Esto se maneja en middleware o rutas
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log(`Intento establecer cookie: ${name}=${value}`, options);
          });
        },
      },
    }
  );
}
