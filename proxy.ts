import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose'

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) return NextResponse.redirect(new URL('/login', request.url));

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jose.jwtVerify(token, secret);

        return NextResponse.next();
    } catch (err) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*"]
}