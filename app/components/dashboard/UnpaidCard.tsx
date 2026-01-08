'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

interface UnpaidData {
    id: number;
    room_number: number;
    fullname: string;
    total_debt: number;
}

const UnpaidCard = () => {
    const [unpaidList, setUnpaidList] = useState<UnpaidData[]>([]); 
    const router = useRouter();
    useEffect(() => {
        const fetchUnpaid = async () => {
            try {
                const res = await fetch('/api/invoices?mode=unpaid')
                if (!res.ok) throw new Error('Failed to fetch the data')
                const data = await res.json();
                console.log(data)
                setUnpaidList(data)
            } catch (err) {
                console.error("Failed to fetch the data from APIs", err)
            }
        }
        fetchUnpaid();
    }, [])

    async function handleTenantClick(id: number) {
        if (!id) {
            alert("No ID provided")
            return;
        }
        router.push(`/tenants/${id}`)

    }

    return (
        <div className=" bg-white p-6 rounded-xl border-l-8 border-red-500 shadow-md col-span-2 ">
            <h3 className="text-gray-500 font-medium text-2xl border-b border-slate-400/50 pb-4">Unpaid Amount</h3>
            <div className="overflow-y-auto max-h-96">
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="px-2">
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Room No.</th>
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Fullname</th>
                            <th className="text-right text-gray-600 text-lg px-4 py-3 font-semibold">Total Debt</th>
                        </tr>
                    </thead>
                    <tbody >
                        {unpaidList.map((item) => (
                            <tr key={item.id} className="odd:bg-white even:bg-slate-100 hover:bg-blue-600/60 cursor-pointer transition-colors" onClick={() => handleTenantClick(item.id)}>
                                <td className="text-sm px-4 py-3 font-bold">{item.room_number}</td>
                                <td className="text-sm px-4 py-3">{item.fullname}</td>
                                <td className="text-right text-sm px-4 py-3 font-bold text-red-600">{item.total_debt}</td>
                            </tr>
                        ))}


                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UnpaidCard