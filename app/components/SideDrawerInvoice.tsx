import React from 'react'

interface PropsData {
    isOpen: boolean;
    onClose: () => void;
}

const SideDrawerInvoice = ({ isOpen, onClose }: PropsData) => {
    return (
        <div className={`bg-black/50 fixed size-full z-50 inset-0 flex justify-end transition-all  duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-100'}`}>
            <div className={`bg-white w-full max-w-lg h-full shadow-2xl p-6 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <h2 className="text-2xl font-bold">Invoice Review</h2>
            </div>
            <button className="bg-green-200 cursor-pointer" onClick={onClose}>Close</button>
        </div>
    )
}

export default SideDrawerInvoice