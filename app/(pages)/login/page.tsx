"use client"
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react"

export default function Page() {
    const [userInput, setUserInput] = useState({
        username: "",
        password: ""
    })

    const router = useRouter();


    function handleOnChangeInput(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setUserInput((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        const res = await fetch("api/auth/login", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                username: userInput.username,
                password: userInput.password
            })
        })

        if (res.ok) {
            router.push('/dashboard')
        } else {
            alert("Failed to login")
            setUserInput({
                username: "",
                password: ""
            })
        }
    }

    return (
        <div className="flex justify-center items-center h-dvh ">
            <form onSubmit={handleOnSubmit} action="" className="flex justify-center items-center flex-col gap-2 bg-linear-65 from-slate-700 to-zinc-800 p-50 shadow-md rounded-md">
                <h1 className="text-white text-2xl font-bold">Login</h1>
                <div className="flex flex-col gap-4 border-t pt-4 border-white">
                    <label htmlFor="username" className="text-white text-md">Username</label>
                    <input type="text" name="username" id="username" className="bg-amber-50 p-2 rounded-md" placeholder="username" value={userInput.username} onChange={handleOnChangeInput} required />
                    <label htmlFor="password" className="text-white text-md">Password</label>
                    <input type="password" name="password" id="password" className="bg-amber-50 p-2 rounded-md" placeholder="password" value={userInput.password} onChange={handleOnChangeInput} required />
                </div>
                <button type="submit" className="bg-gray-100 rounded-md p-6 mt-10 w-full shadow-2xl cursor-pointer transition duration-150 hover:scale-105 hover:bg-slate-300  active:bg-slate-500 text-2xl font-semibold">LOGIN</button>
            </form>
        </div>
    )
}