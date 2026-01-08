'use client'

import { dateFormatter } from "@/lib/formatter";
import { useEffect, useState } from "react"

interface ExpiringLease {
    id: number;
    room_number: string;
    fullname: string;
    start_date: string;
    end_date: string
}

const ExpiringLeasesCard = () => {
    const [leases, setLeases] = useState<ExpiringLease[]>([]);
    const [isFound, setIsFound] = useState<boolean | undefined>();

    useEffect(() => {
        const fetchExpiringLeases = async () => {
            try {
                const res = await fetch('/api/leases?expiring=true');
                if (!res.ok) throw new Error('Failed to fetch the data')
                const data = await res.json();
                setLeases(data);
            } catch (err) {
                console.error("Failed to fetch the data from APIs", err)
            } finally {
                setIsFound(true);
            }
        }
        fetchExpiringLeases();
    }, [])


    return (
        <div className=" bg-white p-6 rounded-xl border-l-8 border-green-500 col-span-2 shadow-md">
            <h3 className="text-gray-500 font-medium text-2xl border-b border-slate-400/50 pb-4">Expiring Leases</h3>
            <div className="overflow-y-auto max-h-96">
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="px-2">
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Room No.</th>
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Monthly Rent</th>
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Start Date</th>
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">End Date</th>
                        </tr>
                    </thead>
                    <tbody >

                        {leases.map((lease) => (
                            <tr key={lease.id} className="odd:bg-white even:bg-slate-100 hover:bg-blue-600/60 cursor-pointer transition-colors">
                                <td className="text-sm px-4 py-3 font-bold">{lease.room_number}</td>
                                <td className="text-sm px-4 py-3">{lease.fullname}</td>
                                <td className="text-sm px-4 py-3 font-bold text-red-600">{dateFormatter(lease.start_date)}</td>
                                <td className="text-sm px-4 py-3 font-bold text-red-600">{dateFormatter(lease.end_date)}</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ExpiringLeasesCard