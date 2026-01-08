import pool from "@/app/database/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const result = await pool.query(`
            SELECT id,
	   fullname,
	   phone_number,
	   id_number
	   FROM tenants
	   WHERE is_active = true
            `);

        return NextResponse.json(result.rows)

    } catch (err) {
        return NextResponse.json({ message: 'Failed to get the Rooms data' }, { status: 409 })
    }
}

export async function POST(request: Request) {
    const { fullname, phone_number, id_number } = await request.json();
    if (!fullname || !phone_number || !id_number) return NextResponse.json({ message: "Please enter all the field data" }, { status: 400 });
    try {
        await pool.query(`INSERT INTO tenants (fullname, phone_number, id_number) VALUES ($1, $2, $3)`, [fullname, phone_number, id_number])
        return NextResponse.json({ message: "Successfully created a tenant data" }, { status: 201 })
    } catch (err) {
        return NextResponse.json({ message: "Failed to created the tenant data" }, { status: 500 })
    }
}