import { NextResponse } from "next/server";
import pool from "@/database/db";

export async function checkingTenant(id: number | string) {
    if (isNaN(Number(id))) return { error: NextResponse.json({ message: 'Invalid ID: must be a number' }, { status: 400 }) };
    

    const result = await pool.query(`SELECT id FROM tenants WHERE id = $1`, [id]);
    if (result.rows.length === 0) return { error: NextResponse.json({ message: `Tenant with id:${id} not found` }, { status: 404 }) }

    return { exists: true };
}