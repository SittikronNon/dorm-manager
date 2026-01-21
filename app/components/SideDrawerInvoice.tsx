'use client'
import { useState } from 'react';
import Invoice from './Invoice';

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
    isOpen: boolean;
    onClose: () => void;
    selectedInvoices: InvoiceData[];
}

const SideDrawerInvoice = ({ isOpen, onClose, selectedInvoices }: PropsData) => {
    const [selectedId, setSelectedId] = useState<number>();

    const activeInvoice = selectedInvoices.find(invoice => invoice.id === selectedId);
    return (
        <div className={`bg-black/50 fixed size-full z-50 inset-0 flex justify-end transition-all p-6  duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className='w-full h-full flex justify-center '>
                <div className={`flex bg-white h-full w-full max-w-5xl transition-opacity delay-200 duration-500 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                    <Invoice selectedInvoice={activeInvoice} />
                </div>
            </div>
            <div className={`bg-white relative w-full max-w-lg h-full shadow-2xl p-6 transform transition-transform duration-300 ease-in-out overflow-y-auto  ${isOpen ? 'translate-x-0' : 'translate-x-full '}`}>
                <h2 className="text-2xl font-bold">Invoice Review</h2>
                <table className="w-full mt-2 border-slate-200 border-collapse">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="px-2">
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Room No.</th>
                            <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Fullname</th>
                            <th className="text-center text-gray-600 text-lg px-4 py-3 font-semibold">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody >
                        {selectedInvoices.map((invoice) => (
                            <tr key={invoice.id} className="odd:bg-white even:bg-slate-100 hover:bg-blue-600/60 cursor-pointer transition-colors" onClick={() => { setSelectedId(invoice.id) }}>
                                <td className="text-sm px-4 py-3 font-bold">{invoice.room_number}</td>
                                <td className="text-sm px-4 py-3 font-bold">{invoice.fullname}</td>
                                <td className="text-sm px-4 py-3 font-bold text-center">{invoice.total_amount}</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
                <button className="absolute top-4 right-4 text-4xl text-gray-500 hover:text-black hover:rotate-90 active:scale-90 transition-all duration-200 cursor-pointer" onClick={onClose}>✕</button>
            </div>
        </div>
    )
}

export default SideDrawerInvoice