import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Deux rôles :
 *  1. Le sous-domaine `leads.transakautoclermontferrand.com` sert le tableau
 *     (les chemins nus sont réécrits vers /board/*).
 *  2. Le tableau est protégé : sans session, on renvoie vers /board/login.
 *
 * Le site public (autre hôte, hors /board) n'est pas touché.
 */
export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0]
  const isLeadsHost = host.startsWith('leads.')
  const originalPath = request.nextUrl.pathname

  // Les routes API s'authentifient elles-mêmes (session pour /api/board/plaquette,
  // jeton pour le service du Mac) : ni réécriture vers /board/api/… (404), ni
  // renvoi vers la page de connexion.
  if (originalPath.startsWith('/api/')) return NextResponse.next()

  const isBoardRequest = isLeadsHost || originalPath.startsWith('/board')
  if (!isBoardRequest) return NextResponse.next()

  // Sur le sous-domaine leads.*, les chemins nus (/ , /admin…) deviennent /board/*
  let path = originalPath
  let rewriteNeeded = false
  if (isLeadsHost && !path.startsWith('/board')) {
    path = '/board' + (path === '/' ? '' : path)
    rewriteNeeded = true
  }

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

  const carry = (target: NextResponse) => {
    response.cookies.getAll().forEach((c) => target.cookies.set(c))
    return target
  }

  const isLoginPage = path === '/board/login'

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/board/login'
    url.search = ''
    return carry(NextResponse.redirect(url))
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/board'
    return carry(NextResponse.redirect(url))
  }

  if (rewriteNeeded) {
    const url = request.nextUrl.clone()
    url.pathname = path
    return carry(NextResponse.rewrite(url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|txt|xml|webp|woff2?)$).*)'],
}
