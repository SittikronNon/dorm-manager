'use client'

import { useEffect, useState } from "react"

interface LeasesData {
    id: number;
    room_number: string;
    fullname: string;
    id_number: string;
    phone_number: string;
    monthly_rent: number;
    start_date: string;
    end_date: string;
    electricity_rate_per_unit: number;
    water_rate_per_unit: number;
    created_at: string,
    status: string;
}

const dateFormatter = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

export default function Page() {
    const [leases, setLeases] = useState<LeasesData[]>([]);

    useEffect(() => {
        const fetchLeases = async () => {
            try {
                const res = await fetch('/api/leases');
                if (!res.ok) throw new Error('Failed to fetch the data');
                const data = await res.json();
                setLeases(data);
            } catch (err) {
                console.error("Failed to fetch the data from APIs", err)
            }
        }
        fetchLeases();
    }, [])

    return (
        <div className="min-h-screen m-4">
            <h1>List of leases</h1>
            <button>+ Add Leases</button>
            <div className="bg-white p-6 rounded-xl border-l-8 border-yellow-500 shadow-sm col-span-2 min-h-96">
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">Room no.</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">Fullname</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">id number</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">Phone number</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">monthly rent</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">start date</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">end date</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">electricity rate </th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">water rate </th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">created at </th>
                            <th className=" text-gray-600 text-md px-4 py-3 font-semibold">status </th>
                        </tr>
                    </thead>
                    <tbody>
                        {leases.map((lease) => (
                            <tr key={lease.id} className="hover:bg-blue-600/60 odd:bg-white even:bg-slate-100 cursor-pointer transition-colors">
                                <td className="text-sm px-4 py-3 font-bold">{lease.room_number}</td>
                                <td className="text-sm px-4 py-3 font-bold">{lease.fullname}</td>
                                <td className="text-sm px-4 py-3 font-bold">{lease.id_number}</td>
                                <td className="text-sm px-4 py-3 font-bold">{lease.phone_number}</td>
                                <td className="text-sm px-4 py-3 font-bold">{lease.monthly_rent}</td>
                                <td className="text-sm px-4 py-3 font-bold">{dateFormatter(lease.start_date)}</td>
                                <td className="text-sm px-4 py-3 font-bold">{dateFormatter(lease.end_date)}</td>
                                <td className="text-sm px-4 py-3 font-bold">{lease.electricity_rate_per_unit}</td>
                                <td className="text-sm px-4 py-3 font-bold">{lease.water_rate_per_unit}</td>
                                <td className="text-sm px-4 py-3 font-bold">{dateFormatter(lease.created_at)}</td>
                                <td className="text-sm px-4 py-3 font-bold text-center align-middle">
                                    <span className={`inline-block rounded-full w-20 ${lease.status === 'active' ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'}`}>
                                        {lease.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}