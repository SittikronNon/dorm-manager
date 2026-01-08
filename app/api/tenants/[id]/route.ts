import { NextResponse } from "next/server";
import pool from "@/app/database/db";

async function checkingTenant(id: number | string) {
    if (isNaN(Number(id))) return { error: NextResponse.json({ message: 'Invalid ID: must be a number' }, { status: 400 }) };

    const result = await pool.query(`SELECT id FROM tenants WHERE id = $1`, [id]);
    if (result.rows.length === 0) return { error: NextResponse.json({ message: `Tenant with id:${id} not found` }, { status: 404 }) }

    return { exists: true };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await checkingTenant(id);

        if (error) return error;

        return NextResponse.json({ message: "PATCH the tenants", }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
    }

}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { error } = await checkingTenant(id);

        if (error) return error;
        const result = await pool.query(`
            SELECT i.id,
	   t.fullname,
	   r.room_number,
	   l.electricity_rate_per_unit,
	   i.electricity_units_used,
	   i.electricity_amount,
	   l.water_rate_per_unit,
	   i.water_units_used,
	   i.water_amount,
	   i.monthly_rent,
	   i.total_amount,
	   i.billing_month,
	   i.status,
	   COALESCE(i.paid_at, null) AS paid_at
	   FROM invoices i
	   JOIN leases l on l.id = i.lease_id
	   JOIN tenants t on t.id = l.tenant_id
	   JOIN rooms r on r.id = l.room_id
	   WHERE t.id = $1
            `, [id])

        return NextResponse.json(result.rows)
    } catch (err) {
        return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
    }
}