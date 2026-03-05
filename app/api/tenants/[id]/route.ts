import { NextResponse } from "next/server";
import { checkingTenant } from "@/lib/checkingTenant";
import { getSession } from "@/lib/auth";
import pool from "@/database/db";


export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { isActive } = await request.json();
    try {
        const { id } = await params;
        const { error } = await checkingTenant(id);

        if (error) return error;
        const query = `
        UPDATE tenants
        SET is_active = $1
        WHERE id = $2
        `

        await pool.query(query, [isActive, id])
        console.log(`test patch ${id}`)

        return NextResponse.json({ message: "PATCH the tenants", }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
    }

}
