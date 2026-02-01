
import { FaPrint } from "react-icons/fa";

interface ActionBarProps {
  onPrint: (mode: 'single' | 'bulk') => void;
}

const ActionBar = ({ onPrint }: ActionBarProps) => {


  return (
    <div className='action-bar flex items-center justify-evenly bg-white w-80 h-10 rounded-4xl'>
      <button onClick={() => onPrint('single')} className="flex justify-center items-center text-sm flex-1 bg-green-300 cursor-pointer rounded-full mx-4">
        PRINT ONE
        <FaPrint />
      </button>
      <button onClick={() => onPrint('bulk')} className="flex justify-center items-center text-sm flex-1 bg-green-300 cursor-pointer rounded-full mx-4">
        PRINT ALL
        <FaPrint />
      </button>
    </div>
  )
}

export default ActionBar