'use client'

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react"

export default function Page() {
    const [inputData, setInputData] = useState({
        fullname: "",
        phoneNumber: "",
        idNumber: ""
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

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
        <div className="h-dvh flex flex-col justify-center items-center gap-2">
            <h1 className="mt-10">Create Tenant</h1>
            <form action="" onSubmit={handleSubmit} className="flex flex-col justify-center items-center rounded-2xl border-green-600 bg-green-50/70 border-l-8 h-full w-3/6 shadow-2xl gap-10">
                <label htmlFor="fullname">Fullname</label>
                <input type="text" id="fullname" name="fullname" value={inputData.fullname} onChange={handleOnInputChange} className="bg-white border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 transition" required />
                <label htmlFor="phone-number">phone number</label>
                <input type="text" id="phone-number" name="phoneNumber" value={inputData.phoneNumber} onChange={handleOnInputChange} className="bg-white border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 transition" required />
                <label htmlFor="id-number">id number</label>
                <input type="text" id="id-number" name="idNumber" value={inputData.idNumber} onChange={handleOnInputChange} className="bg-white border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 transition" required />
                <button type="submit" className={`bg-rose-300 p-4 shadow-md cursor-pointer transition hover:scale-105 duration-150`}>{isSubmitting ? 'Saving...': 'Submit'}</button>
            </form>
        </div>
    )
}