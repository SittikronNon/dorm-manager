import pool from "@/database/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url);
        const onlyExpiring = searchParams.get('expiring');
        //Terminate any expired leases
        await pool.query(`
            WITH expired_leases AS (
                UPDATE leases
                SET status = 'inactive'
                WHERE status = 'active'
                AND end_date < CURRENT_DATE
                RETURNING room_id
            )
            UPDATE rooms
            SET is_available = true
            WHERE id IN (SELECT room_id FROM expired_leases)
        `);



        if (onlyExpiring === "true") {
            const result = await pool.query(`
                SELECT	l.id,
                r.room_number,
                t.fullname,
                l.start_date,
                l.end_date
                FROM leases l
                JOIN rooms r ON r.id = l.room_id
                JOIN tenants t ON t.id = l.tenant_id
                WHERE l.status = 'active'
                AND DATE_TRUNC('month', l.end_date) = DATE_TRUNC('month', CURRENT_DATE)
                `)

            return NextResponse.json(result.rows);
        }

        const result = await pool.query(`
            SELECT	l.id,
            r.room_number,
            t.fullname,
            t.id_number,
            t.phone_number,
            l.monthly_rent,
            l.start_date,
            l.end_date,
            l.electricity_rate_per_unit,
            l.water_rate_per_unit,
            l.created_at,
            (
                SELECT unit FROM meter_readings
                       WHERE room_id = r.id AND reading_type = 'electricity'
                       ORDER BY billing_month DESC, created_at DESC LIMIT 1
            ) as latest_elec_reading,
             (
                SELECT unit FROM meter_readings
                       WHERE room_id = r.id AND reading_type = 'water'
                       ORDER BY billing_month DESC, created_at DESC LIMIT 1
            ) as latest_water_reading,
            l.status
            FROM
            leases l
            JOIN rooms r ON r.id = l.room_id
            JOIN tenants t ON t.id = l.tenant_id
            ORDER BY CASE
                        WHEN l.status = 'active' THEN 1
                        WHEN l.status = 'inactive' THEN 2
                        ELSE 3
                    END ASC,
                    r.room_number ASC
        `)

        return NextResponse.json(result.rows)
    } catch (err) {
        return NextResponse.json({ message: "Failed to load the datas!" }, { status: 409 })
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        
    const { start_date, end_date, monthly_rent, electricity_rate_per_unit, water_rate_per_unit, tenant_id, room_id, start_electricity_reading, start_water_reading } = await request.json();
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

        await client.query(`
            INSERT INTO meter_readings (room_id, reading_type, unit, billing_month)
            VALUES
                ($1, 'electricity', $2, $3),
                ($1, 'water', $4, $3)
            `, [room_id, start_electricity_reading, start_date, start_water_reading])

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