import pool from "@/database/db";
import { getSession } from "@/lib/auth";
import { checkingTenant } from "@/lib/checkingTenant";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('id');
    const noLeaseTenants = searchParams.has('noLease')

    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (noLeaseTenants) {
        const result = await pool.query(`
                        SELECT	t.id AS tenant_id,
                                t.fullname,
                                t.phone_number,
                                t.id_number,
                                t.created_at
                                FROM tenants t
                                LEFT JOIN leases l ON l.tenant_id = t.id
                                WHERE l.id IS NULL
            `);
        return NextResponse.json(result.rows)
    }

    if (tenantId !== null) {
        try {
            const { error } = await checkingTenant(tenantId);
            if (error) return error;
            const id = Number(tenantId);
            const result = await pool.query(`
                        SELECT  id AS tenant_id,
                                fullname,
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

    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { fullname, phone_number, id_number } = await request.json();
    if (!fullname || !phone_number || !id_number) return NextResponse.json({ message: "Please enter all the field data" }, { status: 400 });
    try {
        await pool.query(`INSERT INTO tenants (fullname, phone_number, id_number) VALUES ($1, $2, $3)`, [fullname, phone_number, id_number])
        return NextResponse.json({ message: "Successfully created a tenant data" }, { status: 201 })
    } catch (err) {
        return NextResponse.json({ message: "Failed to created the tenant data" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tenant_id, fullname, phone_number, id_number } = await request.json();
    if (!fullname || !phone_number || !id_number) return NextResponse.json({ message: "Please enter all the field data" }, { status: 400 });
    console.log(`${tenant_id}-${fullname}-${phone_number}-${id_number}`)
    try {
        await pool.query(`
                    UPDATE  tenants
                            SET fullname = $1,
                                phone_number = $2,
                                id_number = $3
                            WHERE id = $4
            `, [fullname, phone_number, id_number, tenant_id])
        return NextResponse.json({ message: "Successfully created a tenant data" }, { status: 201 })
    } catch (err) {
        return NextResponse.json({ message: "Failed on the database" }, { status: 400 })
    }
}