import { NextResponse } from "next/server";
import pool from "@/database/db";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { SignJWT } from "jose";


export async function POST(request: Request) {
    const { username, password } = await request.json();
    if (!username || !password) return NextResponse.json({ message: 'login failed, please fill both username and password!' }, { status: 409 })
    try {
        const userResult = await pool.query('SELECT id, username, password FROM users WHERE username = $1', [username])
        if (userResult.rows.length === 0) return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });

        try {
            const user = userResult.rows[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return NextResponse.json({ message: 'failed to verify' }, { status: 400 });
       

            const secret = new TextEncoder().encode(process.env.JWT_SECRET);


            const token = await new SignJWT({
                userId: user.id,
                username: user.username
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('2h')
                .sign(secret);

            const response = NextResponse.json({ message: "Login successful" }, { status: 200 })
            response.cookies.set({
                name: 'auth_user',
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 2
            })

            return response

        } catch (err) {
            return NextResponse.json({ message: 'failed to verify' }, { status: 400 });
        }

    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: 'user not found!' }, { status: 409 })
    }
}