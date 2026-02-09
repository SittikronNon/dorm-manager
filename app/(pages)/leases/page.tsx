'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { dateFormatter } from "@/lib/formatter";
import Link from "next/link";
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
    latest_elec_reading: number;
    latest_water_reading: number;
    created_at: string,
    status: string;
}



export default function Page() {
    const [leases, setLeases] = useState<LeasesData[]>([]);
    const [isFound, setIsFound] = useState<boolean | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        const fetchLeases = async () => {
            try {
                const res = await fetch('/api/leases');
                if (!res.ok) throw new Error('Failed to fetch the data');
                const data = await res.json();
                console.log(data)
                setLeases(data);
            } catch (err) {
                console.error("Failed to fetch the data from APIs", err)
            } finally {
                setLoading(false)
                setIsFound(true)
            }
        }
        fetchLeases();

    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-r-2 border-blue-600 "></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isFound) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen p-10 text-center">
                <h2 className="text-2xl font-bold">Tenant Not Found</h2>
                <p>The tenant you are looking for does not exist.</p>
                <button onClick={() => { router.push('/dashboard') }} className="text-blue-500 underline cursor-pointer">Back to List</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen m-4">
            <div className="flex border-b border-slate-400/50 pb-4 mb-4 px-4">
                <h1 className="text-gray-500 font-medium text-2xl">List of Leases</h1>
                <Link href='/leases/create' className="ml-auto bg-green-300 p-2 text-lg font-semibold rounded-md shadow-md transition hover:scale-105 hover:bg-green-600 hover:text-white cursor-pointer">+ Add Lease</Link>
            </div>
            <div className="bg-white p-6 overflow-auto rounded-xl border-l-8 border-yellow-500 shadow-sm min-h-96">
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead>
                        <tr className="text-sm">
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold w-25">Room no.</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold w-40">Fullname</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold w-38">รหัสบัตรประชาชน</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold w-30">เบอร์โทรศัพท์</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold w-25">ค่าเช่าห้อง</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold w-30">start date</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold w-30">end date</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold ">electricity rate </th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold ">water rate </th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold ">เลขจดมิเตอร์แรกเข้า (ไฟฟ้า)</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold ">เลขจดมิเตอร์แรกเข้า (น้ำ)</th>
                            <th className="text-left text-gray-600 px-3 py-3 font-semibold w-30">created at </th>
                            <th className=" text-gray-600 text-md px-4 py-3 font-semibold ">status </th>
                        </tr>
                    </thead>
                    <tbody>
                        {leases.map((lease) => (
                            <tr key={lease.id} className={`hover:bg-blue-600/60 ${lease.status === 'active' ? 'odd:bg-white even:bg-slate-100' : 'line-through text-gray-500 bg-gray-100'} cursor-pointer transition-colors`}>
                                <td className="text-sm px-3 py-3">{lease.room_number}</td>
                                <td className="text-sm px-3 py-3 ">{lease.fullname}</td>
                                <td className="text-sm px-3 py-3">{lease.id_number}</td>
                                <td className="text-sm px-3 py-3">{lease.phone_number}</td>
                                <td className="text-sm px-3 py-3">{lease.monthly_rent}</td>
                                <td className="text-sm px-3 py-3">{dateFormatter(lease.start_date)}</td>
                                <td className="text-sm px-3 py-3">{dateFormatter(lease.end_date)}</td>
                                <td className="text-sm px-3 py-3">{lease.electricity_rate_per_unit}</td>
                                <td className="text-sm px-3 py-3">{lease.water_rate_per_unit}</td>
                                <td className="text-sm px-3 py-3">{lease.latest_elec_reading}</td>
                                <td className="text-sm px-3 py-3">{lease.latest_water_reading}</td>
                                <td className="text-sm px-3 py-3">{dateFormatter(lease.created_at)}</td>
                                <td className="text-sm px-3 py-3 text-bold text-center align-middle">
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