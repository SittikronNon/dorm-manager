import { NextResponse } from "next/server";
import { checkingTenant } from "@/lib/checkingTenant";
import { getSession } from "@/lib/auth";


export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
        const { id } = await params;
        const { error } = await checkingTenant(id);

        if (error) return error;

        return NextResponse.json({ message: "PATCH the tenants", }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: "Invalid or empty JSON body" }, { status: 400 })
    }

}
