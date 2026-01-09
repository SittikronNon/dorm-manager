export default function Page() {
    return (
        <div className="h-dvh flex flex-col justify-center items-center gap-2">
            <h1 className="mt-10">Create Leases</h1>
            <form action="" className="flex flex-col justify-center items-center rounded-2xl border-yellow-600 bg-yellow-50/70 border-l-8 h-full w-3/6 shadow-2xl gap-10">
                <label htmlFor="">Tenants</label>
                <select name="pets" id="pet-select">
                    <option value="">--Please choose an option--</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="hamster">Hamster</option>
                    <option value="parrot">Parrot</option>
                    <option value="spider">Spider</option>
                    <option value="goldfish">Goldfish</option>
                </select>
                <label htmlFor="">Rooms</label>
                <select name="pets" id="pet-select">
                    <option value="">--Please choose an option--</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="hamster">Hamster</option>
                    <option value="parrot">Parrot</option>
                    <option value="spider">Spider</option>
                    <option value="goldfish">Goldfish</option>
                </select>
                <label htmlFor="">Start Date</label>
                <input type="date" />
                <label htmlFor="">End Date</label>
                <input type="date" />
                <label htmlFor="">monthly rent</label>
                <input type="text"  />
                <label htmlFor="">monthly rent</label>
                <input type="text"  />
            </form>
        </div>
    )
}