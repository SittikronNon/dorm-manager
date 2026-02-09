import { NextResponse } from "next/server";
import pool from "@/database/db";
import { checkingTenant } from "@/lib/checkingTenant";
import { getSession } from "@/lib/auth";

interface InsertedInvoiceResult {
	id: number;
	lease_id: number;
	billing_month: string;
	electricity_reading: number;
	water_reading: number;
	room_id: number;
}

interface MeterReadingBatch {
	ids: number[];
	types: ('electricity' | 'water')[];
	units: number[];
	months: string[];
	invoice_ids: number[];
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const mode = searchParams.get('mode');
	const tenantId = searchParams.get('tenantId');
	const billingMonth = searchParams.get('month');
	const getYears = searchParams.has('years');
	const createBilling = searchParams.get('billing');

	const session = await getSession();
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })


	if (getYears) {
		try {
			const result = await pool.query(`
						SELECT	DISTINCT EXTRACT(YEAR FROM billing_month) as year
								FROM invoices
								ORDER BY year DESC
			`)
			return NextResponse.json(result.rows)
		} catch (err) {
			return NextResponse.json({ message: "failed on the database side" }, { status: 500 })
		}
	}

	if (createBilling) {
		try {
			const result = await pool.query(`
                SELECT	l.id AS lease_id,
		r.room_number,
		t.fullname,
		l.monthly_rent,
		l.electricity_rate_per_unit,
		l.water_rate_per_unit,
		COALESCE((
        	SELECT unit FROM meter_readings
                WHERE room_id = r.id
				  AND reading_type = 'electricity'
				  AND billing_month < $1
                ORDER BY billing_month DESC, created_at DESC LIMIT 1
        ), 0) as latest_elec_reading,
        COALESCE((
            SELECT unit FROM meter_readings
                WHERE room_id = r.id
				  AND reading_type = 'water'
				  AND billing_month < $1
                ORDER BY billing_month DESC, created_at DESC LIMIT 1
        ),0) as latest_water_reading
		FROM leases l
		JOIN rooms r ON r.id = l.room_id
		JOIN tenants t ON t.id = l.tenant_id
		WHERE l.status = 'active'
            `, [createBilling])
			return NextResponse.json(result.rows)
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

	if (tenantId !== null) {
		try {
			if (!tenantId.trim()) return NextResponse.json({ message: "ID cannot be empty" }, { status: 400 })
			if (isNaN(Number(tenantId))) return NextResponse.json({ message: "Invalid ID format" }, { status: 400 })
			if (Number(tenantId) <= 0) return NextResponse.json({ message: "ID must be a positive number" }, { status: 400 })
			const { error } = await checkingTenant(tenantId);
			if (error) return error;
			const id = Number(tenantId);
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
										ORDER BY 
										CASE 
											WHEN i.status = 'unpaid' THEN 1 
											WHEN i.status = 'pending' THEN 2 
											ELSE 3 
										END ASC,
										i.billing_month DESC
												`, [id])
			return NextResponse.json(result.rows)
		} catch (err) {
			return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
		}
	}

	if (billingMonth) {
		try {
			const result = await pool.query(`
            SELECT  i.id,
			r.room_number AS room_number,
	   t.fullname,
	   i.electricity_units_used,
	   l.electricity_rate_per_unit,
	   i.water_units_used,
	   l.water_rate_per_unit,
	   i.monthly_rent,
	   e.unit AS electricity_reading,
	   w.unit AS water_reading,
	   i.billing_month,
	   i.total_amount,
	   i.status,
	   i.paid_at
	   FROM invoices i
	   LEFT JOIN meter_readings e ON e.invoice_id = i.id AND e.reading_type = 'electricity'
	   LEFT JOIN meter_readings w ON w.invoice_id = i.id AND w.reading_type = 'water'
	   JOIN leases l ON l.id = i.lease_id
	   JOIN rooms r ON r.id = l.room_id
	   JOIN tenants t ON t.id = l.tenant_id
	   WHERE i.billing_month = $1
	   ORDER BY CASE
					WHEN i.status = 'unpaid' THEN 1
					WHEN i.status = 'paid' THEN 2
					ELSE 3
				END ASC,
				room_number ASC
						   `, [billingMonth])
			return NextResponse.json(result.rows)
		} catch (err) {
			return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
		}
	}

	//Showing all invoices
	try {
		const result = await pool.query(`
            SELECT  i.id,
			r.room_number AS room_number,
	   t.fullname,
	   i.electricity_units_used,
	   l.electricity_rate_per_unit,
	   i.water_units_used,
	   l.water_rate_per_unit,
	   i.monthly_rent,
	   e.unit AS electricity_reading,
	   w.unit AS water_reading,
	   i.billing_month,
	   i.total_amount,
	   i.status,
	   i.paid_at
	   FROM invoices i
	   LEFT JOIN meter_readings e ON e.invoice_id = i.id AND e.reading_type = 'electricity'
	   LEFT JOIN meter_readings w ON w.invoice_id = i.id AND w.reading_type = 'water'
	   JOIN leases l ON l.id = i.lease_id
	   JOIN rooms r ON r.id = l.room_id
	   JOIN tenants t ON t.id = l.tenant_id
	   ORDER BY CASE
					WHEN i.status = 'unpaid' THEN 1
					WHEN i.status = 'paid' THEN 2
					ELSE 3
				END ASC,
				room_number ASC
						   `)
		return NextResponse.json(result.rows)
	} catch (err) {
		return NextResponse.json({ message: 'Failed to get the data!' }, { status: 500 })
	}

}


export async function POST(request: Request) {
	const session = await getSession();
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const invoiceQuery = `
					   WITH input_data AS (
					   		SELECT * FROM UNNEST (
								$1::numeric[],
								$2::numeric[],
								$3::numeric[],
								$4::numeric[],
								$5::numeric[],
								$6::numeric[],
								$7::date[],
								$8::numeric[],
								$9::numeric[],
								$10::integer[]
							) AS i(e_units, e_amount, w_units, w_amount, rent, total, month, e_reading, w_reading, l_id)
					   ),
					   inserted_invoices AS (
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
							SELECT
								e_units, e_amount, w_units, w_amount, rent, total, month, l_id
							FROM input_data
							RETURNING id, lease_id, billing_month
					   )
					   SELECT
							ins.id,
							ins.lease_id,
							ins.billing_month,
							inp.e_reading AS electricity_reading,
							inp.w_reading AS water_reading,
							(SELECT room_id FROM leases WHERE id = ins.lease_id) as room_id
					   FROM inserted_invoices ins
					   JOIN input_data inp ON ins.lease_id = inp.l_id AND ins.billing_month = inp.month
			`;
		const params = [
			invoices.map(i => i.electricity_units_used),
			invoices.map(i => i.electricity_amount),
			invoices.map(i => i.water_units_used),
			invoices.map(i => i.water_amount),
			invoices.map(i => i.monthly_rent),
			invoices.map(i => i.total_amount),
			invoices.map(i => i.billing_month),
			invoices.map(i => i.electricity_reading),
			invoices.map(i => i.water_reading),
			invoices.map(i => i.lease_id)
		]
		const result = await client.query<InsertedInvoiceResult>(invoiceQuery, params)
		const createInvoices = result.rows
		const meterParams: MeterReadingBatch = {
			ids: [],
			types: [],
			units: [],
			months: [],
			invoice_ids: [],
		}


		for (const inv of createInvoices) {
			meterParams.ids.push(inv.room_id)
			meterParams.types.push('electricity')
			meterParams.units.push(Number(inv.electricity_reading))
			meterParams.months.push(inv.billing_month)
			meterParams.invoice_ids.push(inv.id)

			meterParams.ids.push(inv.room_id)
			meterParams.types.push('water')
			meterParams.units.push(Number(inv.water_reading))
			meterParams.months.push(inv.billing_month)
			meterParams.invoice_ids.push(inv.id)
		}

		await client.query(`
				INSERT INTO meter_readings (
					room_id,
					reading_type,
					unit,
					billing_month,
					invoice_id
				)
				SELECT * FROM UNNEST (
					$1::integer[],
					$2::text[],
					$3::numeric[],
					$4::date[],
					$5::integer[]
				)
			`, [meterParams.ids, meterParams.types, meterParams.units, meterParams.months, meterParams.invoice_ids])

		await client.query('COMMIT')

		return NextResponse.json({ message: "Successfully Created the new invoices!", params }, { status: 201 })
	} catch (err) {
		await client.query('ROLLBACK')
		console.error(err)
		return NextResponse.json({ message: 'Failed on the database side' }, { status: 500 });
	} finally {
		client.release();
	}

}

export async function PATCH(request: Request) {
	const session = await getSession();
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	let body;
	try {
		const bodyText = await request.text();

		if (!bodyText || bodyText.trim() === "") return NextResponse.json({ message: "No data sent in body" }, { status: 400 })

		body = JSON.parse(bodyText);


	} catch (err) {
		return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
	}

	const ids = Array.isArray(body) ? body : body.invoiceIds || [];

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


export async function DELETE(request: Request) {
	const session = await getSession();
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	let body;
	try {
		const bodyText = await request.text();

		if (!bodyText || bodyText.trim() === "") return NextResponse.json({ message: "No data sent in body" }, { status: 400 })

		body = JSON.parse(bodyText);



	} catch (err) {
		return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
	}

	const ids = Array.isArray(body) ? body : body.invoiceIds || [];

	if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ message: "No valid IDs provided" }, { status: 400 })

	const hasInvalid = ids.some((id: string | number) => isNaN(Number(id)) || id === null);

	if (hasInvalid) return NextResponse.json({ message: "Invalid type of ids! All must be number" });
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		await client.query(`
				DELETE FROM invoices
				WHERE id = ANY($1::int[])
		`, [ids]);
		await client.query('COMMIT')
		return NextResponse.json({ message: 'the Selected Ids has been deleted!' }, { status: 200 })
	} catch (err) {
		await client.query('ROLLBACK')
		return NextResponse.json({ message: "Failed on the database side" }, { status: 500 })
	} finally {
		client.release();
	}


}