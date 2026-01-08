'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

interface TenantData {
    id: number;
    fullname: string;
    phone_number: string;
    id_number: string;
}

export default function Page() {
    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [isFound, setIsFound] = useState<boolean | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/tenants')

                if (res.status === 404) {
                    setIsFound(false)
                    throw new Error(`Tenant not found: ${res.status}`);
                }

                if (!res.ok) throw new Error(`Failed to fetch data with status: ${res.status}`);
                
                const data = await res.json();
                setTenants(data);

            } catch (err) {
                console.error("Failed to fetch data from API", err);
            } finally {
                setLoading(false);
                setIsFound(true)
            }
        }
        fetchTenant();
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
            <h1>List of tenants</h1>
            <button>+ Add Tenant</button>
            <div className="bg-white p-6 rounded-xl border-l-8 border-green-500 shadow-sm col-span-2 min-h-96">
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">Fullname</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">Phone Number</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">ID number</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">
                                View Lease
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-blue-600/60 odd:bg-white even:bg-slate-100 cursor-pointer transition-colors">
                                <td className="px-4 py-3">{tenant.fullname}</td>
                                <td className="px-4 py-3">{tenant.phone_number}</td>
                                <td className="px-4 py-3">{tenant.id_number}</td>
                                <td className="px-4 py-3">
                                    <button className="bg-amber-300 p-2 rounded-md">VIEW</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}