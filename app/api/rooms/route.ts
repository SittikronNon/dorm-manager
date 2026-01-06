import pool from "@/app/database/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const result = await pool.query(`SELECT room_number, monthly_rent, is_available FROM rooms ORDER BY room_number ASC`);
        const rooms = result.rows;
        return NextResponse.json({ message: 'successfully fetch the rooms data', rooms }, { status: 200 })

    } catch (err) {
        return NextResponse.json({ message: 'Failed to get the Rooms data' }, { status: 409 })
    }
}