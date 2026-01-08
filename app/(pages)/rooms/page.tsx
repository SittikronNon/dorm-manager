'use client'

import { useEffect, useState } from "react"

interface RoomsData {
    id: number;
    room_number: string;
    monthly_rent: number;
    is_available: boolean;
}

export default function Page() {
    const [rooms, setRooms] = useState<RoomsData[]>([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch('/api/rooms');
                if (!res.ok) throw new Error('Failed to fetch the data');
                const data = await res.json();
                setRooms(data);
            } catch (err) {
                console.error("Failed to fetch data from API", err);
            }

        }
        fetchRooms();
    }, [])
    return (
        <div className="min-h-screen m-4">
            <h1>List of tenants</h1>
            <button>+ Add Tenant</button>
            <div className="bg-white p-6 rounded-xl border-l-8 border-blue-500 shadow-sm col-span-2 min-h-96">
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">Room Number</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">Monthly Rent</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.id} className="odd:bg-white even:bg-slate-100 hover:bg-blue-600/60 cursor-pointer transition-colors">
                                <td className="px-4 py-3">{room.room_number}</td>
                                <td className="px-4 py-3">{room.monthly_rent}</td>
                                <td className={`px-4 py-3 text-center align-middle`}>
                                    <span className={`inline-block p-1 w-20 rounded-full text-xs font-semibold  ${room.is_available ? 'text-green-600 bg-green-200' : 'text-red-600 bg-red-200'}`}>{room.is_available ? 'ว่าง' : 'ไม่ว่าง'}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}