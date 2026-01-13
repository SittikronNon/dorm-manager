import { NextResponse } from "next/server";
import pool from "@/database/db";
import { checkingTenant } from "@/lib/checkingTenant";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const mode = searchParams.get('mode');
	const tenantId = searchParams.get('tenantId');
	const billingMonth = searchParams.get('month');

	if (mode === 'billing') {
		try {
			const result = await pool.query(`
                SELECT	l.id AS lease_id,
		r.room_number,
		t.fullname,
		l.monthly_rent,
		l.electricity_rate_per_unit,
		l.water_rate_per_unit,
		COALESCE(
			(
				SELECT i2.electricity_reading 
				FROM invoices i2
				JOIN leases l2 ON l2.id = i2.lease_id
				WHERE l2.room_id = l.room_id
				ORDER BY i2.billing_month DESC
				LIMIT 1),
				l.start_electricity_reading
		) AS prev_electricity_reading,
		COALESCE(
			(
				SELECT i2.water_reading 
				FROM invoices i2
				JOIN leases l2 ON l2.id = i2.lease_id
				WHERE l2.room_id = l.room_id
				ORDER BY i2.billing_month DESC
				LIMIT 1),
				l.start_water_reading
		) AS prev_water_reading
		FROM leases l
		JOIN rooms r ON r.id = l.room_id
		JOIN tenants t ON t.id = l.tenant_id
		WHERE l.status = 'active'
            `)
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
	   i.electricity_reading,
	   i.water_reading,
	   i.billing_month,
	   i.total_amount,
	   i.status,
	   i.paid_at
	   FROM invoices i
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
	   i.electricity_reading,
	   i.water_reading,
	   i.billing_month,
	   i.total_amount,
	   i.status,
	   i.paid_at
	   FROM invoices i
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
					   electricity_reading,
					   water_reading,
                       lease_id
                )
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
			invoices.map(i => i.electricity_reading),
			invoices.map(i => i.water_reading),
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
	let body;
	try {
		const bodyText = await request.text();

		if (!bodyText || bodyText.trim() === "") return NextResponse.json({ message: "No data sent in body" }, { status: 400 })

		body = JSON.parse(bodyText);



	} catch (err) {
		return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
	}

	const ids = Array.isArray(body) ? body : body.invoiceIds || [];
	console.log(ids)

	if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ message: "No valid IDs provided" }, { status: 400 })

	const hasInvalid = ids.some((id: string | number) => isNaN(Number(id)) || id === null);

	if (hasInvalid) return NextResponse.json({ message: "Invalid type of ids! All must be number" });

	try {
		const query = `
				DELETE FROM invoices
				WHERE id = ANY($1::int[])
		`
		await pool.query(query, [ids]);
		return NextResponse.json({ message: 'the Selected Ids has been deleted!' }, { status: 200 })
	} catch (err) {
		return NextResponse.json({ message: "Failed on the database side" }, { status: 500 })
	}


}