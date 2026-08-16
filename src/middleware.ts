import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Process i18n routing and locale detection
  const response = handleI18nRouting(request);

  // 2. Process Supabase auth session refresh while preserving response headers & cookies
  return await updateSession(request, response);
}

export const config = {
  // Match all request paths except internal assets and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};