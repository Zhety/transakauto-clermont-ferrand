import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Deux rôles :
 *  1. Le sous-domaine `leads.transakautoclermontferrand.com` sert le tableau
 *     (tout est réécrit vers /board).
 *  2. Le tableau est protégé : sans session, on renvoie vers la page de connexion.
 *
 * Le site public (autre hôte, hors /board) n'est pas touché.
 */
export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0]
  const isLeadsHost = host.startsWith('leads.')
  const { pathname } = request.nextUrl

  const isBoardRequest = isLeadsHost || pathname.startsWith('/board')
  if (!isBoardRequest) return NextResponse.next()

  // Chemin interne (toujours préfixé /board)
  const internalPath = isLeadsHost ? '/board' + (pathname === '/' ? '' : pathname) : pathname
  const isLoginPage = internalPath === '/board/login'

  // Rafraîchit la session Supabase (cookies)
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const carryCookies = (target: NextResponse) => {
    response.cookies.getAll().forEach((c) => target.cookies.set(c))
    return target
  }

  // Pas connecté et pas sur la page de login → redirection vers login
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = isLeadsHost ? '/login' : '/board/login'
    url.search = ''
    return carryCookies(NextResponse.redirect(url))
  }

  // Déjà connecté mais sur la page de login → vers le tableau
  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = isLeadsHost ? '/' : '/board'
    return carryCookies(NextResponse.redirect(url))
  }

  // Sous-domaine leads.* : réécriture vers /board
  if (isLeadsHost) {
    const url = request.nextUrl.clone()
    url.pathname = internalPath
    return carryCookies(NextResponse.rewrite(url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|txt|xml|webp|woff2?)$).*)'],
}
