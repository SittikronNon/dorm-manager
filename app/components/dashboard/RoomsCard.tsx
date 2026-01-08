'use client'
import { useEffect, useState } from "react"

interface roomsData {
  id: number;
  room_number: string;
  monthly_rent: number;
  is_available: boolean;
}


const RoomsCard = () => {
  const [availableRooms, setAvailableRooms] = useState<roomsData[]>([])

  useEffect(() => {
    const fetchAvaiRooms = async () => {
      try {
        const res = await fetch('/api/rooms?available=true');
        if (!res.ok) throw new Error('Failed to fetch the data');
        const data = await res.json();
        console.log(data)
        setAvailableRooms(data);
      } catch (err) {
        console.error("Failed to fetch the data from APIs", err)
      }
    }
    fetchAvaiRooms();
  }, [])

  return (
    <div className=" bg-white p-6 rounded-xl border-l-8 border-blue-500 col-span-2 shadow-md">
      <h3 className="text-gray-500 font-medium text-2xl border-b border-slate-400/50 pb-4">Available Rooms</h3>
      <div className="overflow-y-auto max-h-96">
        <table className="w-full mt-2 border-slate-200 border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="px-2">
              <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Room No.</th>
              <th className="text-left text-gray-600 text-lg px-4 py-3 font-semibold">Monthly Rent</th>
              <th className=" text-gray-600 text-lg px-4 py-3 font-semibold">Available</th>
            </tr>
          </thead>
          <tbody >
            {availableRooms.map((room) => (
              <tr key={room.id} className="hover:bg-blue-600/60 cursor-pointer transition-colors">
                <td className="text-sm px-4 py-3 font-bold">{room.room_number}</td>
                <td className="text-sm px-4 py-3 font-bold">{room.monthly_rent}</td>
                <td className={`px-4 py-3 text-center align-middle `}>
                  <span className={`inline-block py-1 w-20 rounded-full text-xs font-semibold text-green-600`}>ว่าง</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RoomsCard