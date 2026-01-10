'use client'

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react"

interface TenantData {
    tenant_id: number;
    fullname: string;
}

interface RoomData {
    id: number;
    room_number: string;
    monthly_rent: number;
}
export default function Page() {

    const [tenants, setTenants] = useState<TenantData[]>([])
    const [rooms, setRooms] = useState<RoomData[]>([])
    const [isTenantsFound, setIsTenantsFound] = useState<boolean | undefined>(undefined)
    const [isRoomsFound, setIsRoomsFound] = useState<boolean | undefined>(undefined)
    const router = useRouter();

    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        monthlyRent: 0,
        electricityRatePerUnit: 16,
        waterRatePerUnit: 7,
        tenantId: 0,
        roomId: 0

    });

    useEffect(() => {
        const loadPageData = async () => {
            const [tenantsRes, roomsRes] = await Promise.all([
                fetch(`/api/tenants?noLease`),
                fetch(`/api/rooms?available`)
            ])
            if (!tenantsRes.ok) setIsTenantsFound(false);
            if (!roomsRes.ok) setIsRoomsFound(false);

            if (!tenantsRes.ok || !roomsRes.ok) throw new Error(`Failed to fetch data with status:`);

            const tenantsData = await tenantsRes.json();
            const roomsData = await roomsRes.json();

            if (!tenantsData || tenantsData.length === 0) {
                setIsTenantsFound(false);
                return;
            }

            if (!roomsData || roomsData.length === 0) {
                setIsRoomsFound(false);
                return;
            }


            setTenants(tenantsData)
            setIsTenantsFound(true)
            setRooms(roomsData);
            setIsRoomsFound(true);
        }

        loadPageData();
    }, [])

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        console.log(formData)

        const res = await fetch('/api/leases', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                start_date: formData.startDate,
                end_date: formData.endDate,
                monthly_rent: formData.monthlyRent,
                electricity_rate_per_unit: formData.electricityRatePerUnit,
                water_rate_per_unit: formData.waterRatePerUnit,
                tenant_id: formData.tenantId,
                room_id: formData.roomId
            })
        })
        if (res.ok) {
            router.push('/leases');
            router.refresh();
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value, type } = event.target
        const val = type === 'Number' ? Number(value) : value;

        setFormData((prev) => {
            const nextState = { ...prev, [name]: val };
            if(name === "roomId") {
                const room = rooms.find(room => room.id === Number(val));
                nextState.monthlyRent = room ? room.monthly_rent : 0;
            }

            return nextState;
        })
    }


    return (
        <div className="min-h-screen flex flex-col justify-center items-center gap-2 p-6 bg-slate-100">
            <h1 className="mt-10 text-slate-800 text-3xl font-bold">Create Leases</h1>
            <form onSubmit={handleSubmit} action="" className="flex flex-col justify-center bg-yellow-50/70 border-l-8 border-yellow-600 rounded-2xl w-full max-w-2xl p-10 gap-4 shadow-2xl">
                <label htmlFor="tenant" className="">Tenants</label>
                <select name="tenantId" id="tenant" className="bg-white border rounded-md p-2" required onChange={handleInputChange} value={formData.tenantId}>
                    <option value="">--Please choose an option--</option>
                    {tenants.map((tenant) => (
                        <option key={tenant.tenant_id} value={tenant.tenant_id}>{tenant.fullname}</option>
                    ))}
                </select>
                <label htmlFor="room">Available Rooms</label>
                <select name="roomId" id="room" className="bg-white border rounded-md p-2" required onChange={handleInputChange} value={formData.roomId}>
                    <option value="">--Please choose an option--</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>{room.room_number}</option>
                    ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="start-date">Start Date</label>
                        <input name="startDate" type="date" id="start-date" className="bg-white border rounded-md p-2" required onChange={handleInputChange} value={formData.startDate} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="end-date">End Date</label>
                        <input name="endDate" type="date" id="end-date" className="bg-white border rounded-md p-2" required onChange={handleInputChange} value={formData.endDate} />
                    </div>
                </div>
                <label htmlFor="monthly-rent">Monthly Rent</label>
                <input type="number" id="monthly-rent" name="monthlyRent" className="bg-white border rounded-md p-2" required onChange={handleInputChange} value={formData.monthlyRent} />
                <label htmlFor="elec-rate">Electricity rate per unit</label>
                <input type="number" id="elec-rate" name="electricityRatePerUnit" className="bg-white border rounded-md p-2" required onChange={handleInputChange} value={formData.electricityRatePerUnit} />
                <label htmlFor="water-rate">Water rate per unit</label>
                <input type="number" id="water-rate" name="waterRatePerUnit" className="bg-white border rounded-md p-2" required onChange={handleInputChange} value={formData.waterRatePerUnit} />
                <button type="submit" className="bg-yellow-600 rounded-2xl py-4 font-semibold text-white text-3xl hover:scale-105 transition duration-150 cursor-pointer">Create Lease</button>
            </form>
        </div>
    )
}