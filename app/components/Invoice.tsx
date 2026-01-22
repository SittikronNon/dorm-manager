import React from 'react'
import { dateFormatter } from '@/lib/formatter';

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
                <div className='flex w-full mx-10 my-4 text-white'>
                    <div className='flex-1'>
                        <h1 className='text-4xl font-bold'>Wanna House</h1>
                        <p>
                            123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย<br />
                            กรุงเทพมหานคร 10110<br />
                            โทร: 02-123-4567 | อีเมล: info@grandapt.com
                        </p>
                    </div>
                    <div className='flex-1 text-right'>
                        <h1 className='text-4xl font-bold'>ใบแจ้งหนี้</h1>
                        <p>
                            รหัส INV-2026-001<br />
                            {dateFormatter(selectedInvoice.billing_month)}<br />
                        </p>
                    </div>
                </div>
            </div>
            <div className='mx-10'>
                <div className='flex h-36 w-full my-5 gap-2'>
                    <div className='bg-zinc-100 shadow-md border-l-4 border-slate-800 rounded-2xl flex-1'>
                        <div className='flex flex-col ml-10 mt-4 h-full w-full'>
                            <h1 className='font-medium'>ออกบิลให้</h1>
                            <div className='mt-2 text-sm'>
                                <p>คุณ{selectedInvoice.fullname}</p>
                                <p>ห้อง {selectedInvoice.room_number}</p>
                            </div>
                        </div>
                    </div>
                    <div className='bg-zinc-100 shadow-md border-l-4 border-slate-800 rounded-2xl flex-1'>
                        <div className='flex flex-col ml-10 mt-4 h-full w-full'>
                            <h1 className='font-medium'>รายละเอียดห้องพัก</h1>
                            <div className='mt-2 text-sm'>
                                <p className='font-medium'>ห้อง {selectedInvoice.room_number}</p>
                                <p>ประเภท: 1 ห้องนอน</p>
                                <p>ขนาด: </p>
                                <p>สัญญาเช่า: </p>
                            </div>
                        </div>
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
                <div className='flex mt-4 pb-6 border-b border-zinc-300'>
                    <div className='w-full flex items-center h-42 shadow-md bg-slate-800/5 flex-2'>
                        <span className='ml-10'>หมายเหตุ: </span>
                    </div>
                    <div className='h-42 shadow-md bg-slate-800/5 flex-1 border-slate-950/30 border'>
                        <div className='w-full flex justify-between px-10'>
                            <span>รวมเป็นเงิน</span>
                            <span className=''>{selectedInvoice.total_amount}</span>
                        </div>
                        <div className='w-full flex justify-between px-10'>
                            <span>ส่วนลด</span>
                            <span className=''>0.00</span>
                        </div>
                        <div className='w-full flex justify-between px-10'>
                            <span>ภาษีมูลค่าเพิ่ม 7%</span>
                            <span className=''>0.00</span>
                        </div>
                        <div className='w-full flex justify-between px-10 py-6 bg-slate-800 text-white'>
                            <span>ภาษีมูลค่าเพิ่ม 7%</span>
                            <span className=''>{selectedInvoice.total_amount}</span>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col h-30 justify-end items-end gap-10'>
                    <span className='text-center w-50 '>ลงชื่อ</span>
                    <span className='border-b w-50'></span>
                </div>
            </div>
        </div>
    )
}

export default Invoice