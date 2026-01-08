'use client'
import { notFound, useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react";

interface TenantData {
    id: number;
    fullname: string;
    room_number: string;
    electricity_rate_per_unit: number;
    electricity_units_used: number;
    electricity_amount: number;
    water_rate_per_unit: number;
    water_units_used: number;
    water_amount: number;
    monthly_rent: number;
    total_amount: number;
    billing_month: string;
    status: string;
    paid_at: string;
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
    const params = useParams();
    const [tenantInvoices, setTenantInvoices] = useState<TenantData[]>([]);
    const [isFound, setIsFound] = useState<boolean | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const [tenantData, setTenantData] = useState({
        fullname: "",
        roomNumber: ""
    })

    const router = useRouter();

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                setLoading(true);

                const res = await fetch(`/api/tenants/${params.id}`);

                if (res.status === 404) {
                    setIsFound(false)
                    throw new Error(`Tenant not found: ${res.status}`);
                }

                if (!res.ok) {
                    throw new Error(`Failed to fetch data with status: ${res.status}`);
                }

                const data = await res.json();
                setTenantInvoices(data);
                setTenantData({
                    fullname: data[0].fullname,
                    roomNumber: data[0].room_number
                })

            } catch (err) {
                console.error("Failed to fetch data from API", err);
            } finally {
                setLoading(false);
                setIsFound(true)
            }
        };

        if (params.id) {
            fetchTenant();
        }
    }, [params.id]);


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

    // handle 404
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
        <div className="m-4">
            <div>
                <h1>{tenantData.fullname}</h1>
                <h1>{tenantData.roomNumber}</h1>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-8 border-red-500 shadow-sm col-span-2">
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead className="border-b border-slate-300">
                        <tr className="px-2">
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">Invoice id</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">electricity rate</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">electricity used</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">electricity amount</th>
                            <th className="text-left text-gray-600 text-md px-4 py-3 font-semibold">water rate</th>
                            <th className="text-right text-gray-600 text-md px-4 py-3 font-semibold">water used</th>
                            <th className="text-right text-gray-600 text-md px-4 py-3 font-semibold">water amount</th>
                            <th className="text-right text-gray-600 text-md px-4 py-3 font-semibold">monthly rent</th>
                            <th className="text-right text-gray-600 text-md px-4 py-3 font-semibold">total amount</th>
                            <th className="text-right text-gray-600 text-md px-4 py-3 font-semibold">billing month</th>
                            <th className="text-right text-gray-600 text-md px-4 py-3 font-semibold">status</th>
                            <th className="text-right text-gray-600 text-md px-4 py-3 font-semibold">paid at</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenantInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-blue-600/60 odd:bg-white even:bg-slate-100 cursor-pointer transition-colors">
                                <td className="px-4 py-3">{invoice.id}</td>
                                <td className="px-4 py-3">{invoice.electricity_rate_per_unit}</td>
                                <td className="px-4 py-3">{invoice.electricity_units_used}</td>
                                <td className="px-4 py-3">{invoice.electricity_amount}</td>
                                <td className="px-4 py-3">{invoice.water_rate_per_unit}</td>
                                <td className="px-4 py-3">{invoice.water_units_used}</td>
                                <td className="px-4 py-3">{invoice.water_amount}</td>
                                <td className="px-4 py-3">{invoice.monthly_rent}</td>
                                <td className="px-4 py-3">{invoice.total_amount}</td>
                                <td className="px-4 py-3">{dateFormatter(invoice.billing_month)}</td>
                                <td className={`px-4 py-3 text-center align-middle `}>
                                    <span className={`inline-block py-1 w-20 rounded-full text-xs font-semibold ${invoice.status === 'paid' ? 'text-green-600 bg-green-200' : 'text-red-600 bg-red-200'}`}>{invoice.status}</span>
                                </td>
                                <td className="px-4 py-3">{dateFormatter(invoice.paid_at)}</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}