'use client'
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { useState } from 'react';
import Invoice from './Invoice';
import ActionBar from "./ActionBar";

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
    const [direction, setDirection] = useState('right');

    const activeInvoice = selectedInvoices.find(invoice => invoice.id === selectedId);
    const currInvoiceIndex = selectedInvoices.findIndex(invoice => invoice.id === selectedId)

    const isFirstItem = currInvoiceIndex === 0;
    const isLastItem = currInvoiceIndex === selectedInvoices.length - 1;

    function handleNext() {
        setSelectedId((prev) => {
            const index = selectedInvoices.findIndex((invoice) => invoice.id === prev)
            if (index < selectedInvoices.length - 1) {
                return selectedInvoices[index + 1].id
            }
            return prev;
        })
        setDirection('right')
    }

    function handlePrev() {
        setSelectedId((prev) => {
            const index = selectedInvoices.findIndex((invoice) => invoice.id === prev)
            if (index > 0) {
                return selectedInvoices[index - 1].id
            }
            return prev;
        })
        setDirection('left')
    }
    return (
        <div className={`bg-black/50 fixed size-full z-50 inset-0 flex justify-end transition-all p-6  duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className='w-full h-full flex flex-col justify-center items-center '>
                <div className="flex flex-col items-center w-full h-full gap-4">
                    <ActionBar />
                    <div className={` relative flex bg-white h-full w-full max-w-5xl transition-opacity delay-200 duration-500 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                        <button className="flex justify-center absolute w-20 -left-22 cursor-pointer duration-150 top-1/2 -translate-y-1/2 z-10 p-3 bg-white text-black rounded-full hover:bg-blue-400 disabled:opacity-0 transition" onClick={handlePrev} disabled={isFirstItem}><FaChevronCircleLeft size={50} />
                        </button>
                        <div
                            className={`flex-1 overflow-y-auto ${direction === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}
                            key={activeInvoice?.id}
                        >
                            <Invoice selectedInvoice={activeInvoice} />
                        </div>
                        <button className="flex justify-center absolute w-20 -right-22 cursor-pointer duration-150 top-1/2 -translate-y-1/2 z-10 p-3 bg-white text-black rounded-full hover:bg-blue-400 disabled:opacity-0 transition" onClick={handleNext} disabled={isLastItem}><FaChevronCircleRight size={50} />
                        </button>
                    </div>
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