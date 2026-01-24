
import { FaPrint } from "react-icons/fa";
const ActionBar = () => {
  return (
    <div className='flex items-center justify-evenly bg-white w-72 h-8 rounded-4xl'>
      <button className="flex justify-center items-center text-sm w-24 bg-green-300">
        PRINT ALL
        <FaPrint />
      </button>
      <button className="flex justify-center items-center text-sm w-24 bg-green-300">
        PRINT ONE
        <FaPrint />
      </button>
    </div>
  )
}

export default ActionBar