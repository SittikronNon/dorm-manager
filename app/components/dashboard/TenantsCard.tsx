"use client"

import { dateFormatter } from "@/lib/formatter";
import Link from "next/link";
import { useEffect, useState } from "react"


interface TenantData {
    tenant_id: number;
    fullname: string;
    phone_number: string;
    id_number: string;
    created_at: string
}

const TenantsCard = () => {
    const [isFound, setIsFound] = useState<boolean | undefined>();
    const [tenants, setTenants] = useState<TenantData[]>([])

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await fetch('/api/tenants?noLease');
                if (!res.ok) throw new Error(`Failed to fetch data with status:`);

                const data = await res.json();
                if (!data || data.length === 0) {
                    setIsFound(false);
                    return;
                }

                setTenants(data);
                setIsFound(true)
            } catch (err) {
                console.error("Failed to fetch data from API");
            }
        }
        fetchTenants();
    }, [])

    if (!isFound) {
        return (
            <div className=" bg-white p-6 rounded-xl border-l-8 border-yellow-500  col-span-2 shadow-md">
                <h3 className="text-gray-500 font-medium text-2xl">Tenant</h3>
                <div className="flex flex-col justify-center items-center p-10 text-center h-full">
                    <h2 className="text-2xl font-bold">No Data for now!</h2>
                    <p>There is no data  exist for now.</p>
                </div>
            </div>
        )
    }



    return (
        <div className=" bg-white p-6 rounded-xl border-l-8 border-yellow-500 col-span-2 shadow-md">
            <div className="flex border-b border-slate-400/50 pb-4 mb-4 px-4">
                <h3 className="text-gray-500 font-medium text-2xl pb-4">Tenants with no lease</h3>
                <Link href='/leases/create' className="ml-auto bg-yellow-300 p-2 text-lg font-semibold rounded-md shadow-md transition hover:scale-105 hover:bg-yellow-600 hover:text-white cursor-pointer">+ Add Lease</Link>
            </div>
            <div className="overflow-y-auto max-h-96">
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="px-2">
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Fullname</th>
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Phone Number</th>
                            <th className=" text-gray-600 text-lg px-4 py-3 font-semibold">ID Number</th>
                            <th className=" text-gray-600 text-lg px-4 py-3 font-semibold">Created At</th>
                        </tr>
                    </thead>
                    <tbody >
                        {tenants.map((tenant) => (
                            <tr key={tenant.tenant_id} className="odd:bg-white even:bg-slate-100 hover:bg-blue-600/60 cursor-pointer transition-colors">
                                <td className="text-sm px-4 py-3 font-bold">{tenant.fullname}</td>
                                <td className="text-sm px-4 py-3 font-bold">{tenant.phone_number}</td>
                                <td className="text-sm px-4 py-3 font-bold">{tenant.id_number}</td>
                                <td className="text-sm px-4 py-3 font-bold">{dateFormatter(tenant.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TenantsCard