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
        <div className=' bg-indigo-100 w-64 h-dvh flex flex-col sticky top-0 text-center'>
            <Link href='/' className='text-3xl cursor-pointer hover:bg-amber-100 font-semibold border-b border-indigo-300/50 py-6 transition duration-150' >Wanna House</Link>
            <nav className='flex flex-col mt-6 gap-6'>
                <ul>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path || (pathname.startsWith(link.path) && link.path !== "/");
                        return (
                            <li key={link.name} className={`hover:bg-amber-100 transition duration-100 cursor-pointer active:bg-amber-300 ${ isActive ? 'bg-red-500' : ''} `}>
                                <Link className={`block py-4 px-12 w-full h-full active:scale-95`} href={link.path}>{link.name}</Link>
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