"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Tenants', path: '/tenants' },
        { name: 'Rooms', path: '/rooms' },
        { name: 'Leases', path: '/leases' },
        { name: 'Invoices', path: '/invoices' },
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
        <div className=' bg-linear-65 from-slate-700 to-zinc-800 w-64 h-dvh flex flex-col sticky top-0 text-center'>
            <Link href='/' className='text-3xl cursor-pointer hover:bg-stone-400 font-semibold border-b border-indigo-300/50 py-6 transition duration-150 text-white' >Wanna House</Link>
            <nav className='flex flex-col mt-6 gap-6'>
                <ul>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path || (pathname.startsWith(link.path) && link.path !== "/");
                        return (
                            <li key={link.name} className={`hover:bg-stone-400 transition duration-100 cursor-pointer active:bg-zinc-300  ${ isActive ? 'bg-zinc-500' : ''} `}>
                                <Link className={`block py-4 px-12 w-full h-full active:scale-95 font-semibold text-lg text-white active:text-black transition-colors`} href={link.path}>{link.name}</Link>
                            </li>
                        )
                    })}

                </ul>

            </nav>

            <div className="p-4 border-t border-slate-800 mt-auto">
                <button className="w-full text-left p-2 hover:text-red-400" onClick={handleLogout}>Logout</button>
                <button className="w-full text-left p-2 hover:text-red-400" onClick={() => { router.push('/login') }}>login</button>
            </div>
        </div >
    )
}

export default Sidebar