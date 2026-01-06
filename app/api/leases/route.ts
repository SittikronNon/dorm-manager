import pool from "@/app/database/db";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    try {
        const result = await pool.query(`SELECT 
                        t.fullname AS tenant_name,
                        r.room_number AS room_number,
                        l.start_date,
                        l.end_date,
                        l.monthly_rent,
                        l.electricity_rate_per_unit,
                        l.water_rate_per_unit,
                        CASE
                            WHEN l.end_date < CURRENT_DATE THEN 'expired'
                            ELSE l.status
                        END AS current_status,
                        l.created_at
                        FROM leases l
                        JOIN tenants t ON t.id = l.tenant_id
                        JOIN rooms r ON r.id = l.room_id
                        ORDER BY room_number ASC
             `)
        const leases = result.rows;
        return NextResponse.json({ message: "Successfully loaded all the leases!", leases }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: "Failed to load the datas!" }, { status: 409 })
    }
}

export async function POST(request: Request) {
    const { start_date, end_date, monthly_rent, electricity_rate_per_unit, water_rate_per_unit, tenant_id, room_id } = await request.json();
    if (!start_date || !end_date || !monthly_rent || !electricity_rate_per_unit || !water_rate_per_unit || !tenant_id || !room_id) return NextResponse.json({ message: "Please fill all of the data!" }, { status: 409 })
    if (new Date(start_date) >= new Date(end_date)) return NextResponse.json({ message: 'Start date must be lower than end date' }, { status: 400 });
    if (monthly_rent <= 0) return NextResponse.json({ mseeage: "The number must be a positive number" }, { status: 400 })

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const tenantCheck = await client.query('SELECT id, is_active FROM tenants WHERE id = $1', [tenant_id])
        if (tenantCheck.rows.length === 0) return NextResponse.json({ mesage: 'Tenant ID does not exist in the database' }, { status: 404 });
        if (tenantCheck.rows[0].is_active === false) return NextResponse.json({ message: 'Tenant is not active!' }, { status: 400 })

        const tenantLeaseCheck = await client.query(`SELECT id FROM leases WHERE tenant_id = $1 AND status = 'active'`, [tenant_id]);
        if (tenantLeaseCheck.rows.length > 0) return NextResponse.json({ message: "Tenant already has an active lease" }, { status: 400 });

        const roomCheck = await client.query(`SELECT is_available FROM  rooms WHERE id = $1`, [room_id]);
        if (roomCheck.rows.length === 0) return NextResponse.json({ message: 'The room is not found' }, { status: 404 })
        if (roomCheck.rows[0].is_available !== true) return NextResponse.json({ message: 'The room is currently occupied' }, { status: 400 })

        await client.query(`INSERT INTO leases (start_date, end_date, monthly_rent, electricity_rate_per_unit, water_rate_per_unit, tenant_id, room_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [start_date, end_date, monthly_rent, electricity_rate_per_unit, water_rate_per_unit, tenant_id, room_id])

        await client.query(`
                UPDATE rooms
                SET is_available = false
                WHERE id = $1
            `, [room_id])
        await client.query('COMMIT')
        return NextResponse.json({ message: 'Successfully insert a new lease!' }, { status: 201 })
    } catch (err) {
        await client.query('ROLLBACK')
        console.error(err);
        return NextResponse.json({ message: 'Failed to POST data to the Database' }, { status: 500 })
    } finally {
        client.release();
    }
}