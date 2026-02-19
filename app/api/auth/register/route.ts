import { NextResponse } from "next/server";
import pool from "@/database/db";
import bcrypt from "bcrypt"


export async function POST(request: Request) {
    const { username, password, registerSecret } = await request.json();
    if (!username || !password) return NextResponse.json({ message: 'Registration failed, please provide both username and password!' }, { status: 400 })
    if (registerSecret !== process.env.REGISTER_SECRET) {
        return NextResponse.json(
            { error: "Unauthorized: Invalid Secret Key" },
            { status: 401 }
        );
    }
    try {
        const saltRounds = 12;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const query = `INSERT INTO users (username, password) VALUES ($1, $2)`
        await pool.query(query, [username, hashPassword])
        return NextResponse.json({ message: 'Registered' })

    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: 'user not found!' }, { status: 409 })
    }
}