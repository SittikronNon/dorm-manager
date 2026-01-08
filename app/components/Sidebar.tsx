"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const links = [
        {name: 'Dashboard', path: '/dashboard'}
    ]

    async function handleLogout() {
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { "Content-Type": "application/json" }
        })

        if (res.ok) {
            router.refresh();
        }
    }
    return (
        <div className=' bg-indigo-100 w-64 h-dvh flex flex-col sticky top-0 text-center'>
            <Link href='/' className='text-3xl cursor-pointer hover:bg-amber-100 font-semibold border-b border-indigo-300/50 py-6 transition duration-150' >Wanna House</Link>
            <nav className='flex flex-col mt-6 gap-6'>
                <ul>
                    <li className='hover:bg-amber-100 transition duration-100 py-4 px-12 cursor-pointer '>
                        <Link href='/dashboard'>Dashboard</Link>
                    </li>
                    <li className='hover:bg-amber-100 transition duration-100 py-4 px-12 cursor-pointer'>
                        <Link href='/tenants'>Tenants</Link>
                    </li>
                    <li className='hover:bg-amber-100 transition duration-100 py-4 px-12 cursor-pointer'>
                        <Link href='/rooms'>Rooms</Link>
                    </li>
                    <li className='hover:bg-amber-100 transition duration-100 py-4 px-12 cursor-pointer'>
                        <Link href='/leases'>Leases</Link>
                    </li>
                    <li className='hover:bg-amber-100 transition duration-100 py-4 px-12 cursor-pointer'>
                        <Link href='/invoices'>Invoices</Link>
                    </li>
                </ul>

            </nav>

            <div className="p-4 border-t border-slate-800 mt-auto">
                <button className="w-full text-left p-2 hover:text-red-400" onClick={handleLogout}>Logout</button>
                <button className="w-full text-left p-2 hover:text-red-400" onClick={() => { router.push('/login') }}>login</button>
            </div>
        </div>
    )
}

export default Sidebar