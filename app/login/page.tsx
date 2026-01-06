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
            <form onSubmit={handleOnSubmit} action="" className="flex justify-center items-center flex-col gap-2 bg-violet-300 p-50 shadow-md">
                <h1>Login Page!</h1>
                <div className="flex flex-col gap-2">
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" className="bg-amber-50" placeholder="username" value={userInput.username} onChange={handleOnChangeInput} required />
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" className="bg-amber-50" placeholder="password" value={userInput.password} onChange={handleOnChangeInput} required />
                </div>
                <button type="submit" className="bg-amber-50 p-6">TEST</button>
            </form>
        </div>
    )
}