import ExpiringLeasesCard from "@/app/components/dashboard/ExpiringLeasesCard"
import Rooms from "@/app/components/dashboard/RoomsCard"
import TenantsCard from "@/app/components/dashboard/TenantsCard"
import UnpaidCard from "@/app/components/dashboard/UnpaidCard"
import Link from "next/link"

export default function Page() {
  return (
    <div>
      <div className="flex justify-between m-5">
        <h1 className="text-2xl font-semibold">Dashboard / Overview</h1>
        <Link href='/invoices' className="bg-rose-300 rounded-2xl p-4 shadow-md text-lg font-semibold border-b border-rose-100 hover:scale-105 transition duration-150 cursor-pointer">New Invoices</Link>
      </div>
      
      <div className="grid grid-rows-2 grid-cols-4 h-dvh gap-6 mx-2">
        <UnpaidCard />
        <Rooms />
        <ExpiringLeasesCard />
        <TenantsCard />
      </div>

    </div>
  )
}
