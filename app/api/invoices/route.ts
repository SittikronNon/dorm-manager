import { NextResponse } from "next/server";
import pool from "@/app/database/db";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const mode = searchParams.get('mode');

	if (mode === 'billing') {
		try {
			const result = await pool.query(`
                SELECT
                   t.fullname,
                   r.room_number,
                   l.monthly_rent,
                   l.electricity_rate_per_unit,
                   l.water_rate_per_unit
                   FROM leases l
                   JOIN tenants t ON t.id = l.tenant_id
                   JOIN rooms r ON r.id = l.room_id
                   WHERE l.status = 'active'
                   ORDER BY r.room_number ASC
            `)
			return NextResponse.json({ templates: result.rows }, { status: 200 })
		} catch (err) {
			return NextResponse.json({ message: "failed on the database side" }, { status: 500 })
		}
	}

	if (mode === 'unpaid') {
		try {
			const result = await pool.query(`SELECT 
                                        t.id,
                                        r.room_number,
                                        t.fullname,
                                        SUM(i.total_amount) AS total_debt
                                        FROM invoices i
                                        JOIN leases l ON l.id = i.lease_id
                                        JOIN rooms r ON r.id = l.room_id
                                        JOIN tenants t ON t.id = l.tenant_id
                                        WHERE i.status = 'unpaid'
                                        GROUP BY r.room_number, t.fullname, t.id
                                        ORDER BY r.room_number ASC`)
			return NextResponse.json(result.rows);

		} catch (err) {
			return NextResponse.json({ message: 'Failed on the database side' }, { status: 409 })
		}
	}

	try {
		const result = await pool.query(`
            SELECT r.room_number AS room_number,
	   t.fullname,
	   i.electricity_units_used,
	   l.electricity_rate_per_unit,
	   i.water_units_used,
	   l.water_rate_per_unit,
	   i.monthly_rent,
	   i.total_amount,
	   i.status,
	   i.paid_at
	   FROM invoices i
	   JOIN leases l ON l.id = i.lease_id
	   JOIN rooms r ON r.id = l.room_id
	   JOIN tenants t ON t.id = l.tenant_id
	   ORDER BY room_number ASC`)
		const invoices = result.rows
		return NextResponse.json({ message: 'Invoices retrieved!', invoices }, { status: 200 })
	} catch (err) {
		return NextResponse.json({ message: 'Failed to get the data!' }, { status: 500 })
	}

}


export async function POST(request: Request) {
	const bodyText = await request.text();

	if (!bodyText || bodyText.trim() === "") return NextResponse.json({ message: "No data sent in body" }, { status: 400 })


	let body;
	try {
		body = JSON.parse(bodyText);
	} catch (err) {
		return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
	}

	const invoices = Array.isArray(body) ? body : [body];
	if (invoices.length === 0) return NextResponse.json({ message: "No invoice data provided" }, { status: 400 })

	try {

		const query = `
					   INSERT INTO invoices (
                       electricity_units_used,
                       electricity_amount,
                       water_units_used,
                       water_amount,
                       monthly_rent,
                       total_amount,
                       billing_month,
                       lease_id
                )
					   SELECT * FROM UNNEST (
					   		$1::numeric[],  $2::numeric[],  $3::numeric[], $4::numeric[], $5::numeric[], $6::numeric[], $7::date[], $8::integer[]
					   )
			`;
		const params = [
			invoices.map(i => i.electricity_units_used),
			invoices.map(i => i.electricity_amount),
			invoices.map(i => i.water_units_used),
			invoices.map(i => i.water_amount),
			invoices.map(i => i.monthly_rent),
			invoices.map(i => i.total_amount),
			invoices.map(i => i.billing_month),
			invoices.map(i => i.lease_id)
		]

		await pool.query(query, params)
		return NextResponse.json({ message: "Successfully Created the new invoices!", params }, { status: 201 })
	} catch (err) {
		return NextResponse.json({ message: 'Failed on the database side' }, { status: 500 });
	}

}

export async function PATCH(request: Request) {
	let body;
	try {
		const bodyText = await request.text();

		if (!bodyText || bodyText.trim() === "") return NextResponse.json({ message: "No data sent in body" }, { status: 400 })

		body = JSON.parse(bodyText);


	} catch (err) {
		return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
	}

	const ids = Array.isArray(body) ? body : body.invoicesId || [];

	if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ message: "No valid IDs provided" }, { status: 400 })

	const hasInvalid = ids.some((id: string | number) => isNaN(Number(id)) || id === null);

	if (hasInvalid) return NextResponse.json({ message: "Invalid type of ids! All must be number" });


	try {
		const query = `
					UPDATE invoices
					set status = 'paid', paid_at = NOW()
					WHERE id = ANY($1::int[])
		`
		await pool.query(query, [ids])
		return NextResponse.json({ message: "test Patch invoices", ids }, { status: 200 });
	} catch (err) {
		return NextResponse.json({ message: "Failed on the database side" }, { status: 500 })
	}
}