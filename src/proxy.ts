import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "stock_manager_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function proxy(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const secretKey = process.env.AUTH_SECRET_KEY;

    // If no secret key is configured, skip authentication (for local dev)
    if (!secretKey) {
        return NextResponse.next();
    }

    const queryKey = searchParams.get("key");

    // If the correct key is provided in URL, set cookie and redirect to clean URL
    if (queryKey === secretKey) {
        const url = request.nextUrl.clone();
        url.searchParams.delete("key");
        const response = NextResponse.redirect(url);
        response.cookies.set(AUTH_COOKIE_NAME, secretKey, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
        });
        return response;
    }

    // If already authenticated via cookie, allow access
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
    if (authCookie?.value === secretKey) {
        return NextResponse.next();
    }

    // Not authenticated - return 403
    return new NextResponse(
        `<!DOCTYPE html>
<html>
<head><title>Access Denied</title></head>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:sans-serif;background:#111;color:#888;">
  <div style="text-align:center;">
    <h1 style="font-size:3rem;margin-bottom:0.5rem;">🔒</h1>
    <p style="font-size:1.2rem;">Access Denied</p>
  </div>
</body>
</html>`,
        {
            status: 403,
            headers: { "Content-Type": "text/html" },
        }
    );
}

export const config = {
    // Apply to all routes except static files and Next.js internals
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
