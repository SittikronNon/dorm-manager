import pool from "@/database/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const onlyAvailable = searchParams.has('available');
    if (onlyAvailable) {
        try {
            const result = await pool.query(`SELECT id,
                                                    room_number,
                                                    monthly_rent
                                                    FROM rooms
                                                    WHERE is_available = true
                                                    ORDER BY room_number ASC
                                            `)
            return NextResponse.json(result.rows);

        } catch (err) {
            return NextResponse.json({ message: 'Failed on the database side' }, { status: 409 })
        }
    } else {
        try {
            const result = await pool.query(`SELECT	* FROM rooms ORDER BY room_number ASC`);
            return NextResponse.json(result.rows)

        } catch (err) {
            return NextResponse.json({ message: 'Failed to get the Rooms data' }, { status: 409 })
        }
    }

}