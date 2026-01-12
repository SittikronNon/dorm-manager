'use client'

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react"

export default function Page() {
    const [inputData, setInputData] = useState({
        fullname: "",
        phoneNumber: "",
        idNumber: ""
    });
    
    const isFormInValid = !inputData.fullname || !inputData.phoneNumber || !inputData.idNumber;

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [errors, setErrors] = useState<string[]>([]);

    const router = useRouter();

    function handleOnInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setInputData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setIsSubmitting(true)
        const res = await fetch('/api/tenants', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullname: inputData.fullname,
                phone_number: inputData.phoneNumber,
                id_number: inputData.idNumber
            })
        })

        if (res.ok) {
            router.push('/tenants');
            router.refresh();
        }
    }
    return (
        <div className="min-h-screen flex flex-col justify-center items-center gap-2 p-6 bg-slate-100">
            <h1 className="mt-10 text-slate-800 text-3xl font-bold">Create Tenant</h1>
            <form action="" onSubmit={handleSubmit} className="flex flex-col justify-center w-full max-w-2xl px-10 py-20 shadow-md bg-green-50/70 rounded-2xl border-l-8 border-green-600 gap-4">
                <label htmlFor="fullname">Fullname</label>
                <input type="text" id="fullname" name="fullname" value={inputData.fullname} onChange={handleOnInputChange} className="bg-white border rounded-md px-4 py-2 outline-none focus:ring-2 transition invalid:ring-red-400" required />
                <label htmlFor="phone-number">phone number</label>
                <input type="text" id="phone-number" name="phoneNumber" value={inputData.phoneNumber} onChange={handleOnInputChange} className="bg-white border rounded-md px-4 py-2 outline-none focus:ring-2 transition invalid:ring-red-400" required />
                <label htmlFor="id-number">id number</label>
                <input type="text" id="id-number" name="idNumber" value={inputData.idNumber} onChange={handleOnInputChange} className="bg-white border rounded-md px-4 py-2 outline-none focus:ring-2 transition invalid:ring-red-400" required />
                <button type="submit" className={`mt-10 p-4 rounded-2xl shadow-md font-semibold text-3xl transition duration-150
                    ${isFormInValid
                        ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                        : 'bg-green-900 text-white cursor-pointer hover:scale-105 hover:bg-green-700 active:scale-95'
                    }
                    `}>{isSubmitting ? 'Saving...' : 'Submit'}</button>
            </form>
        </div>
    )
}