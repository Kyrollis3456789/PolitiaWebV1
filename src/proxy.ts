import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // 1. Execute i18n routing and locale detection
  const i18nResponse = handleI18nRouting(request);

  // 2. Synchronize Supabase Auth session & cookies
  const { response, user } = await updateSession(request, i18nResponse);

  // 3. Protected route guard: /dashboard requires authenticated session
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.includes('/dashboard');

  if (isDashboardRoute && !user) {
    const segments = pathname.split('/').filter(Boolean);
    const hasLocalePrefix = routing.locales.includes(segments[0] as any);
    const localePrefix = hasLocalePrefix ? `/${segments[0]}` : '';
    const loginUrl = new URL(`${localePrefix}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated users visiting /login are redirected to /dashboard
  const isLoginRoute = pathname.endsWith('/login') || pathname === '/login';
  if (isLoginRoute && user) {
    const segments = pathname.split('/').filter(Boolean);
    const hasLocalePrefix = routing.locales.includes(segments[0] as any);
    const localePrefix = hasLocalePrefix ? `/${segments[0]}` : '';
    const dashboardUrl = new URL(`${localePrefix}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  // Match all request paths except internal assets and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
