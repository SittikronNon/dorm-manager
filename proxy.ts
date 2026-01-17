import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose'

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("auth_user")?.value;
    const isApiRequest = request.nextUrl.pathname.startsWith('/api');
    if (!token) {
        if (isApiRequest) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jose.jwtVerify(token, secret);

        return NextResponse.next();
    } catch (err) {
        if (isApiRequest) {
            return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/tenants/:path*",
        "/rooms/:path*",
        "/leases/:path*",
        "/invoices/:path*"
    ]
}