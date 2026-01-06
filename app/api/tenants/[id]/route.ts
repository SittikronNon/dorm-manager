import { NextResponse } from "next/server";
import pool from "@/app/database/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (isNaN(Number(id))) return NextResponse.json({ message: 'Invalid ID: must be a number' }, { status: 400 });
    const checkTenant = await pool.query(`SELECT id, fullname, phone_number, id_number, is_active FROM tenants WHERE id = $1`, [id]);
    if (checkTenant.rows.length === 0) return NextResponse.json({ message: `Tenant with id:${id} not found` }, { status: 404 })

    return NextResponse.json({ message: "PATCH the tenants", id }, { status: 200 })
}