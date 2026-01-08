import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({ message: "Logged out successful!" });

        response.cookies.set({
            name: "auth_user",
            value: "",
            maxAge: 0,
            expires: new Date(0),
            path: '/'
        });

        return response
    } catch (err) {
        return NextResponse.json({message: "failed to logout!"})
    }
}