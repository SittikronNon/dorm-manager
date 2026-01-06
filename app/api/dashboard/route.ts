import pool from "@/app/database/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    return NextResponse.json({ message: 'test dashboard' })
}