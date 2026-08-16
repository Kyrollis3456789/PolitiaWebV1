import { createServerClient } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { response, user: null };
  }

  // If the i18n middleware produced a redirect (3xx), return immediately
  if (response.status >= 300 && response.status < 400) {
    return { response, user: null };
  }

  let user = null;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch (error) {
    // Catch network/cookie parsing issues safely without crashing the root pipeline
    console.error('Supabase middleware session refresh error:', error);
  }

  return { response, user };
}