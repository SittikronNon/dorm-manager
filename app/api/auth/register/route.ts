import { NextResponse } from "next/server";
import pool from "@/database/db";
import bcrypt from "bcrypt"


export async function POST(request: Request) {
const { username, password } = await request.json();
    if (!username || !password) return NextResponse.json({ message: 'login failed, please fill both username and password!' }, {status:409})
    try {
        const saltRounds = 12;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const query = `INSERT INTO users (username, password) VALUES ($1, $2)`
        await pool.query(query, [username, hashPassword])
        return NextResponse.json({message: 'Registered'})

    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: 'user not found!' }, {status:409})
    }
}