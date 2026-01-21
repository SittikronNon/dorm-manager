import React from 'react'

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

interface PropsData {
    selectedInvoice: InvoiceData | undefined;
}

const Invoice = ({ selectedInvoice }: PropsData) => {

    if (!selectedInvoice) {
        return <div className="p-10 text-center text-gray-400">Please select an invoice</div>;
    }

    const isWaterExceeded = selectedInvoice.water_units_used > 10
    const totalWater = isWaterExceeded
        ? (selectedInvoice.water_units_used - 10) * selectedInvoice.water_rate_per_unit + 160
        : 160
    const totalElec = selectedInvoice.electricity_units_used * selectedInvoice.electricity_rate_per_unit;
    return (
        <div className='justify-center bg-zinc-50 h-full w-full'>
            <div className='flex w-full h-36 bg-slate-800'>
                <div className='flex w-full mx-10 my-2'>
                    <div className='bg-red-400 flex-1'>

                    </div>
                    <div className='bg-green-400 flex-1'>

                    </div>
                </div>
            </div>
            <div className='mx-10'>
                <div className='flex h-36 w-full my-5'>
                    <div className='bg-blue-400 flex-1'>

                    </div>
                    <div className='bg-yellow-400 flex-1'>

                    </div>
                </div>
                <div className='overflow-hidden rounded-xl border border-slate-200 shadow-sm h-46'>
                    <table className='w-full '>
                        <thead className='bg-slate-800 text-white rounded-2xl'>
                            <tr className=''>
                                <th className='py-4 px-4 text-left'>ลำดับ</th>
                                <th className='py-4 px-8 text-left'>รายการ</th>
                                <th className='py-4'>จำนวน</th>
                                <th className='py-4'>หน่วย</th>
                                <th className='py-4 text-right'>ราคา/หน่วย</th>
                                <th className='py-4 px-4 text-right'>จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody className='bg-zinc-50  rounded-2xl'>
                            <tr className='text-center bg-white'>
                                <td className='py-2 px-4 text-left'>1</td>
                                <td className='py-2 px-8 text-left'>ค่าห้อง</td>
                                <td className='py-2'>1</td>
                                <td className='py-2'>เดือน</td>
                                <td className='py-2 text-right'>{selectedInvoice.monthly_rent ?? "0.00"}</td>
                                <td className='py-2 px-4 text-right'>{selectedInvoice.monthly_rent ?? "0.00"}</td>
                            </tr>
                            <tr className='text-center bg-slate-100'>
                                <td className='py-2 px-4 text-left'>2</td>
                                <td className='py-2 px-8 text-left'>ค่าน้ำประปา</td>
                                <td className='py-2'>{selectedInvoice.water_units_used ?? "0.00"}</td>
                                <td className='py-2'>หน่วย</td>
                                <td className='py-2 text-right'>{selectedInvoice.water_rate_per_unit ?? "0.00"}</td>
                                <td className='py-2 px-4 text-right'>{totalWater}</td>
                            </tr>
                            <tr className='text-center bg-white'>
                                <td className='py-2 px-4 text-left'>3</td>
                                <td className='py-2 px-8 text-left'>ค่าไฟฟ้า</td>
                                <td className='py-2'>{selectedInvoice.electricity_units_used}</td>
                                <td className='py-2'>หน่วย</td>
                                <td className='py-2 text-right'>{selectedInvoice.electricity_rate_per_unit}</td>
                                <td className='py-2 px-4 text-right'>{totalElec}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>
                <div className='flex mt-4'>
                    <div className='h-40  bg-zinc-500 flex-1'>

                    </div>
                    <div className='h-40  bg-slate-800/5 flex-1'>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Invoice