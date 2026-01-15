'use client'

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react"
import { dateFormatter } from "@/lib/formatter";
import Link from "next/link";


interface InvoiceData {
    id: number;
    room_number: number;
    fullname: string;
    electricity_units_used: number;
    electricity_reading: number;
    electricity_rate_per_unit: number;
    water_units_used: number;
    water_reading: number;
    water_rate_per_unit: number;
    monthly_rent: number;
    total_amount: number;
    billing_month: string;
    status: string;
    paid_at: string;
}

interface SelectedYear {
    year: string;
}

const currentYear = new Date().getFullYear();
const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];


export default function Page() {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [isFound, setIsFound] = useState<boolean | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const router = useRouter();

    const [availableYears, setAvailableYears] = useState<SelectedYear[]>([]);
    const [invoicesMonth, setInvoicesMonth] = useState<string>("all");
    const [invoicesYear, setInvoicesYear] = useState<string>(String(currentYear));

    useEffect(() => {
        const fetchMetadata = async () => {

            const res = await fetch('/api/invoices?years');
            const data = await res.json();
            console.log(data)
            setAvailableYears(data);
        };
        fetchMetadata();
    }, []);


    useEffect(() => {

        const fetchTenant = async () => {
            try {
                setLoading(true);
                const url = invoicesMonth === "all"
                    ? `/api/invoices?all`
                    : `/api/invoices?month=${invoicesMonth}`
                const res = await fetch(url)
                console.log(invoicesMonth)
                if (res.status === 404) {
                    setIsFound(false)
                    return;
                }
                if (!res.ok) throw new Error(`Failed to fetch data with status: ${res.status}`);

                const data = await res.json();
                setInvoices(data);
                setIsFound(true)
            } catch (err) {
                console.error("Failed to fetch data from API", err);
            } finally {
                setLoading(false);

            }
        }
        fetchTenant();
    }, [invoicesMonth])



    function toggleSelection(id: number) {
        setSelectedIds((prev) => (
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        ))
    }

    function handleSelectedAll(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.checked) {
            const selectedAll = invoices.map((invoice) => invoice.id)
            setSelectedIds(selectedAll)
        } else {
            setSelectedIds([]);
        }
    }

    async function handleOnMonthChange(event: ChangeEvent<HTMLSelectElement>) {
        const selectedMonth = event.target.value;
        setInvoicesMonth(selectedMonth)
        if (selectedMonth !== "all") {
            router.push(`/invoices?month=${selectedMonth}`)
        } else {
            router.push(`/invoices`)
        }
    }

    async function handleOnYearChange(event: ChangeEvent<HTMLSelectElement>) {
        const selectedYear = event.target.value;
        setInvoicesYear(selectedYear);

    }

    async function handleMarkAsPaid() {
        const res = await fetch('/api/invoices/', {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                invoiceIds: selectedIds
            })
        })
        if (res.ok) {
            setSelectedIds([]);
            window.location.reload();
        } else {
            alert("Something went wrong. Please check your connection.");
        }
    }

    async function handleDeleteSelected() {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} invoices?`)) {
            return;
        }
        const res = await fetch('/api/invoices/', {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                invoiceIds: selectedIds
            })
        })
        if (res.ok) {
            setSelectedIds([]);
            window.location.reload();
        } else {
            alert("Something went wrong. Please check your connection.");
        }
    }

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
                <h1 className="text-gray-500 font-medium text-2xl">List of Invoices</h1>

                <div className="ml-auto">
                    <select name="invoiceMonth" id="invoice-month" className="border p-2 rounded-md cursor-pointer mx-5" onChange={handleOnYearChange}>
                        {availableYears.map((item) => (
                            <option value={item.year} key={item.year}>{item.year}</option>
                        ))}

                    </select>
                    <select name="invoiceMonth" id="invoice-month" className="border p-2 rounded-md cursor-pointer mx-5" value={invoicesMonth} onChange={handleOnMonthChange}>
                        <option className="" value="all">แสดงทั้งหมด (All Invoices)</option>
                        {months.map((month, index) => {
                            const monthVal = String(index + 1).padStart(2, '0');
                            return (
                                <option key={index} value={`${invoicesYear}-${monthVal}-01`}>{month}</option>
                            )
                        })}
                    </select>
                    <button onClick={handleMarkAsPaid} className={`mx-5 ${selectedIds.length === 0 ? 'bg-slate-400 cursor-not-allowed text-slate-200' : 'bg-green-300 cursor-pointer hover:bg-green-600 hover:text-white'} p-2 text-lg font-semibold rounded-md shadow-md transition hover:scale-105  `}>Mark as paid</button>
                    <button onClick={handleDeleteSelected} className={`mx-5 ${selectedIds.length === 0 ? 'bg-slate-400 cursor-not-allowed text-slate-200' : 'bg-red-300 cursor-pointer hover:bg-red-600 hover:text-white'} p-2 text-lg font-semibold rounded-md shadow-md transition hover:scale-105  `}>Delete Selected</button>
                    <Link href='/invoices/create' className="mx-5 bg-yellow-300 p-2 text-lg font-semibold rounded-md shadow-md transition hover:scale-105 hover:bg-yellow-600 hover:text-white cursor-pointer">+ Add Invoices</Link>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border-l-8 border-red-500 shadow-sm col-span-2 min-h-96">
                <table className={`w-full mt-2 border-slate-200 border-collapse`} >
                    <thead>
                        <tr>
                            <th className="text-left py-3 px-4">
                                <input
                                    type="checkbox"
                                    className=""
                                    onChange={handleSelectedAll}
                                />
                            </th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Room No.</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Fullname</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Electricity Rate</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Electricity Reading</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Electricity Used</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Water Rate</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Water Reading</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Water Used</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Monthly Rent</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Total Amount</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Billing Month</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Paid At</th>
                            <th className="text-gray-600 text-md px-4 py-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-blue-600/60 odd:bg-white even:bg-slate-100 cursor-pointer transition-colors text-center">
                                <td className="py-3 px-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(invoice.id)}
                                        onChange={() => toggleSelection(invoice.id)}
                                    />
                                </td>
                                <td className="px-4 py-3">{invoice.room_number}</td>
                                <td className="px-4 py-3">{invoice.fullname}</td>
                                <td className="px-4 py-3">{invoice.electricity_rate_per_unit}</td>
                                <td className="px-4 py-3">{invoice.electricity_reading}</td>
                                <td className="px-4 py-3">{invoice.electricity_units_used}</td>
                                <td className="px-4 py-3">{invoice.water_rate_per_unit}</td>
                                <td className="px-4 py-3">{invoice.water_reading}</td>
                                <td className="px-4 py-3">{invoice.water_units_used}</td>
                                <td className="px-4 py-3">{invoice.monthly_rent}</td>
                                <td className="px-4 py-3">{invoice.total_amount}</td>
                                <td className="px-4 py-3">{dateFormatter(invoice.billing_month)}</td>
                                <td className="px-4 py-3">{dateFormatter(invoice.paid_at)}</td>
                                <td className="px-4 py-3 text-bold text-center align-middle">
                                    <span className={`inline-block w-20 text-sm rounded-full ${invoice.status === 'paid' ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'}`}>
                                        {invoice.status === 'paid' ? 'ชำระแล้ว' : 'ค้างชำระ'}
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