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
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        monthlyRent: 0,
        electricityRatePerUnit: 7,
        waterRatePerUnit: 16,
        tenantId: 0,
        roomId: 0,
        startElecReading: 0,
        startWaterReading: 0

    });

    const isFormInValid = !formData.startDate || !formData.endDate || !formData.monthlyRent || !formData.electricityRatePerUnit || !formData.waterRatePerUnit || !formData.tenantId || !formData.roomId;

    useEffect(() => {
        const loadPageData = async () => {
            try {
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
            } catch (err) {
                console.error("Failed to fetch data from API");
            } finally {
                setLoading(false);
            }

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
                room_id: formData.roomId,
                start_electricity_reading: formData.startElecReading,
                start_water_reading: formData.startWaterReading
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
            if (name === "roomId") {
                const room = rooms.find(room => room.id === Number(val));
                nextState.monthlyRent = room ? room.monthly_rent : 0;
            }

            return nextState;
        })
    }

    if (!isTenantsFound) {
        return (
            <div className=" min-h-screen flex flex-col justify-center items-center gap-2 p-6 bg-slate-100">
                <h3 className="text-gray-500 font-medium text-2xl">No tenants found</h3>
                <div className="flex flex-col justify-center items-center p-10 text-center h-full">
                    <h2 className="text-2xl font-bold">No Tenants!</h2>
                    <p>Please create a new tenant.</p>
                </div>
            </div>
        )
    }

    if (!isRoomsFound) {
        return (
            <div className=" min-h-screen flex flex-col justify-center items-center gap-2 p-6 bg-slate-100">
                <h3 className="text-gray-500 font-medium text-2xl">No rooms found</h3>
                <div className="flex flex-col justify-center items-center p-10 text-center h-full">
                    <h2 className="text-2xl font-bold">No Rooms Available!</h2>
                    <p>Please make sure that rooms is available.</p>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen flex flex-col justify-center items-center gap-2 p-6 bg-slate-100">
            <h1 className="mt-10 text-slate-800 text-3xl font-bold">Create Leases</h1>
            <form onSubmit={handleSubmit} action="" className="flex flex-col justify-center bg-yellow-50/70 border-l-8 border-yellow-600 rounded-2xl w-full max-w-2xl p-10 gap-4 shadow-2xl">
                <label htmlFor="tenant" className="">Tenants</label>
                <select name="tenantId" id="tenant" className="bg-white border rounded-md p-2 focus:ring invalid:ring" required onChange={handleInputChange} value={formData.tenantId}>
                    <option value="">--Please choose an option--</option>
                    {tenants.map((tenant) => (
                        <option key={tenant.tenant_id} value={tenant.tenant_id}>{tenant.fullname}</option>
                    ))}
                </select>
                <label htmlFor="room">Available Rooms</label>
                <select name="roomId" id="room" className="bg-white border rounded-md p-2 focus:ring  invalid:border-red-500" required onChange={handleInputChange} value={formData.roomId}>
                    <option value="">--Please choose an option--</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>{room.room_number}</option>
                    ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="start-date">Start Date</label>
                        <input name="startDate" type="date" id="start-date" className="bg-white border rounded-md p-2 focus:ring-2 invalid:ring-red-400" required onChange={handleInputChange} value={formData.startDate} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="end-date">End Date</label>
                        <input name="endDate" type="date" id="end-date" className="bg-white border rounded-md p-2 focus:ring invalid:ring-red-400" required onChange={handleInputChange} value={formData.endDate} />
                    </div>
                </div>
                <label htmlFor="monthly-rent">Monthly Rent</label>
                <input type="number" id="monthly-rent" name="monthlyRent" className="bg-white border rounded-md p-2 focus:ring-2 invalid:ring-red-400" required onChange={handleInputChange} value={formData.monthlyRent} />
                <label htmlFor="elec-rate">Electricity rate per unit</label>
                <input type="number" id="elec-rate" name="electricityRatePerUnit" className="bg-white border rounded-md p-2 focus:ring-2 invalid:ring-red-400" required onChange={handleInputChange} value={formData.electricityRatePerUnit} />
                <label htmlFor="water-rate">Water rate per unit</label>
                <input type="number" id="water-rate" name="waterRatePerUnit" className="bg-white border rounded-md p-2 focus:ring-2 invalid:ring-red-400" required onChange={handleInputChange} value={formData.waterRatePerUnit} />

                <label htmlFor="start-elec-reading">Start Electricity Reading</label>
                <input type="number" id="start-elec-reading" name="startElecReading" className="bg-white border rounded-md p-2 focus:ring-2 invalid:ring-red-400" required onChange={handleInputChange} value={formData.startElecReading} />
                <label htmlFor="start-water-reading">Start Water Reading</label>
                <input type="number" id="start-water-reading" name="startWaterReading" className="bg-white border rounded-md p-2 focus:ring-2 invalid:ring-red-400" required onChange={handleInputChange} value={formData.startWaterReading} />
                <button type="submit" className={`mt-10 p-4 rounded-2xl shadow-md font-semibold text-3xl transition duration-150
                    ${isFormInValid
                        ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                        : 'bg-yellow-900 text-white cursor-pointer hover:scale-105 hover:bg-yellow-700 active:scale-95'
                    }
                    `}>{isSubmitting ? 'Saving...' : 'Submit'}</button>
            </form>
        </div>
    )
}