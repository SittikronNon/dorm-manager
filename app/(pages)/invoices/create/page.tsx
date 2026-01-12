'use client'

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react"

interface BillingData {
    lease_id: number;
    room_number: string;
    fullname: string;
    monthly_rent: number;
    electricity_rate_per_unit: number;
    prev_electricity_reading: number;
    water_rate_per_unit: number;
    prev_water_reading: number;
}

interface CalcResult {
    elecUsed: number;
    waterUsed: number;
    elecAmount: number;
    waterAmount: number;
    totalAmount: number;
}



function invoiceCalculation(bill: BillingData, currReadings: { elec: string; water: string; }): CalcResult {

    //Electricity

    const elecUsed = Number(currReadings.elec) > bill.prev_electricity_reading
        ? Number(currReadings.elec) - bill.prev_electricity_reading
        : 0;
    const elecAmount = elecUsed * bill.electricity_rate_per_unit

    //Water
    const currWaterUnitsMeter = Number(currReadings.water) - bill.prev_water_reading;
    const waterUsed = Number(currReadings.water) > bill.prev_water_reading && currWaterUnitsMeter >= 10
        ? currWaterUnitsMeter - 10
        : 0;
    const waterAmount = 160 + (waterUsed * bill.water_rate_per_unit)

    //total
    const totalAmount = Number(bill.monthly_rent) + elecAmount + waterAmount
    return { elecUsed, waterUsed, elecAmount, waterAmount, totalAmount }
}



export default function Page() {
    const [inputData, setInputData] = useState({
        billingMonth: "",

    });

    const [record, setRecord] = useState<Record<number, { elec: string; water: string }>>({});
    const router = useRouter();

    const isFormInValid = !inputData.billingMonth

    const [isFound, setIsFound] = useState<boolean | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [billingInfo, setBillingInfo] = useState<BillingData[]>([]);

    useEffect(() => {
        const fetchBillingInfo = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/invoices?mode=billing')
                if (res.status === 404) {
                    setIsFound(false)
                    return;
                }
                if (!res.ok) throw new Error(`Failed to fetch data with`);

                const data = await res.json();
                console.log(data)
                setBillingInfo(data);
                setIsFound(true)
            } catch (err) {
                console.error("Failed to fetch data from API", err);
            } finally {
                setLoading(false);

            }
        }

        fetchBillingInfo();
    }, [])




    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setInputData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    function handleReadingChange(leaseId: number, name: 'elec' | 'water', value: string) {
        setRecord((prev) => ({
            ...prev,
            [leaseId]: {
                ... (prev[leaseId] || { elec: "", water: "" }),
                [name]: value
            }
        }))
    }

    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = billingInfo.map((bill) => {
            const recordReading = record[bill.lease_id] || { elec: "", water: "" }
            const result = invoiceCalculation(bill, recordReading)

            return {
                monthly_rent: bill.monthly_rent,
                electricity_units_used: result.elecUsed,
                electricity_amount: result.elecAmount,
                water_units_used: result.waterUsed,
                water_amount: result.waterAmount,
                total_amount: result.totalAmount,
                billing_month: inputData.billingMonth,
                electricity_reading: recordReading.elec,
                water_reading: recordReading.water,
                lease_id: bill.lease_id
            }
        })

        const res = await fetch('/api/invoices/', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })

        if(res.ok) {
            router.push('/invoices');
            router.refresh();
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
        <div className="min-h-screen flex flex-col justify-center items-center gap-2 p-6 bg-slate-100">
            <h1 className="mt-10 mb-5 text-slate-800 text-3xl font-bold">Create Invoices</h1>
            <form action="" onSubmit={handleOnSubmit} className="flex flex-col justify-center w-full px-10 py-20 shadow-md bg-slate-50 rounded-2xl border-l-8 border-red-600 gap-4">
                <label htmlFor="billing-month"></label>
                <input type="date" className="mx-50 border" value={inputData.billingMonth} id="billing-month" name="billingMonth" onChange={handleChange} />
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left py-3 px-4">
                                <input type="checkbox" className="" />
                            </th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Room No.</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Fullname</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Electricity Rate</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Previous Electricity Used</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Electricity Used</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Electricity Amount</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Water Rate</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Previous Water Used</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Water Used</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Water Amount</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Monthly Rent</th>
                            <th className="text-gray-600 text-sm px-4 py-3 font-semibold">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billingInfo.map((bill) => {
                            const rowData = record[bill.lease_id] || { elec: "", water: "" }

                            const calculatedBill = invoiceCalculation(bill, rowData)
                            return (
                                <tr key={bill.lease_id} className="hover:bg-blue-600/60 odd:bg-white even:bg-slate-100 cursor-pointer transition-colors">
                                    <td className="py-3 px-4">
                                        <input type="checkbox" />
                                    </td>
                                    <td className="py-3 px-4">{bill.room_number}</td>
                                    <td className="py-3 px-4 min-w-40">{bill.fullname}</td>
                                    <td className="py-3 px-4 text-center">{bill.electricity_rate_per_unit}</td>
                                    <td className="py-3 px-4 text-center">{bill.prev_electricity_reading}</td>
                                    <td className="py-3 px-4 text-center"><input type="number" className="border" name="elecUsed" value={rowData.elec} onChange={(e) => { handleReadingChange(bill.lease_id, 'elec', e.target.value) }} /></td>
                                    <td className="py-3 px-4 text-center">{calculatedBill.elecAmount}</td>
                                    <td className="py-3 px-4 text-center">{bill.water_rate_per_unit}</td>
                                    <td className="py-3 px-4 text-center">{bill.prev_water_reading}</td>
                                    <td className="py-3 px-4 text-center"><input type="number" className="border" value={rowData.water} onChange={(e) => { handleReadingChange(bill.lease_id, 'water', e.target.value) }} /></td>
                                    <td className="py-3 px-4 text-center">{calculatedBill.waterAmount}</td>
                                    <td className="py-3 px-4 text-center">{bill.monthly_rent}</td>
                                    <td className="py-3 px-4 text-center">{calculatedBill.totalAmount}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <button type="submit" className={`mt-10 p-4 rounded-2xl shadow-md font-semibold text-3xl transition duration-150
                    ${isFormInValid
                        ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                        : 'bg-green-900 text-white cursor-pointer hover:scale-105 hover:bg-green-700 active:scale-95'
                    }
                    `}>{isSubmitting ? 'Creating...' : 'Submit'}</button>
            </form>
        </div>
    )
}