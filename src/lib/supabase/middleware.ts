import { createServerClient } from "@supabase/ssr"; import { NextResponse, type NextRequest } from "next/server"; import type { CookieOptions } from "@supabase/ssr";
export async function updateSession(request: NextRequest) { let response = NextResponse.next({ request });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) return response;
const supabase = createServerClient(url, key, { cookies: { getAll() { return request.cookies.getAll(); }, setAll( list: { name: string; value: string; options?: CookieOptions; }[] ) { list.forEach(({ name, value }) => request.cookies.set(name, value) );
    response = NextResponse.next({ request });

    list.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    );
  },
},
});
const { data: { user }, } = await supabase.auth.getUser();
if (!user && request.nextUrl.pathname.startsWith("/admin")) { const loginUrl = request.nextUrl.clone(); loginUrl.pathname = "/login"; loginUrl.search = ""; return NextResponse.redirect(loginUrl); }
return response; }