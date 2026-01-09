import { NextResponse } from "next/server";
import { checkingTenant } from "@/lib/checkingTenant";


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
