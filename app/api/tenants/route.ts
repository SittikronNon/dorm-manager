import pool from "@/database/db";
import { checkingTenant } from "@/lib/checkingTenant";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('id');
    const noLeaseTenants = searchParams.has('noLease')

    if (noLeaseTenants) {
        const result = await pool.query(`
                        SELECT 	t.id AS tenant_id,
                                t.fullname
                                FROM tenants t
                                LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
                                WHERE l.id IS NULL
                                AND t.is_active = true
            `);
        return NextResponse.json(result.rows)
    }

    if (tenantId !== null) {
        try {
            const { error } = await checkingTenant(tenantId);
            if (error) return error;
            const id = Number(tenantId);
            const result = await pool.query(`
                        SELECT  fullname,
                                phone_number,
                                id_number
                                FROM tenants
                                WHERE is_active = true
                                AND id = $1
                `, [id])
            return NextResponse.json(result.rows[0])
        } catch (err) {
            return NextResponse.json({ message: 'Failed to get tenant data' })
        }
    }

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
        return NextResponse.json({ message: 'Failed to get the tenant data' }, { status: 409 })
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