
import { FaPrint } from "react-icons/fa";
const ActionBar = () => {

  return (
    <div className='action-bar flex items-center justify-evenly bg-white w-80 h-10 rounded-4xl'>
      <button onClick={() => window.print()} className="flex justify-center items-center text-sm flex-1 bg-green-300 cursor-pointer rounded-full mx-4">
        PRINT ONE
        <FaPrint />
      </button>
      <button className="flex justify-center items-center text-sm flex-1 bg-green-300 cursor-pointer rounded-full mx-4">
        PRINT ALL
        <FaPrint />
      </button>
    </div>
  )
}

export default ActionBar