import ExpiringLeasesCard from "@/app/components/dashboard/ExpiringLeasesCard"
import Rooms from "@/app/components/dashboard/RoomsCard"
import TenantsCard from "@/app/components/dashboard/TenantsCard"
import UnpaidCard from "@/app/components/dashboard/UnpaidCard"

export default function Page() {
  return (
    <div>
      <div className="flex justify-between m-5">
        <h1 className="text-2xl font-semibold">Dashboard / Overview</h1>
        <button className="bg-indigo-500 px-4">New Invoices</button>
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
