import { MdPending } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

export default function ActionButtons({ item }) {
    return (
        <>
            {(item?.shelved === undefined || item?.shelved === 0) && (
                <div className="flex items-center justify-center w-20 h-10 border-4 border-red-500 rounded">
                    <MdPending className="w-6 h-6 text-red-500" />
                </div>
            )}

            {item?.shelved && item?.shelved === 1 && (
                <div className="flex items-center justify-center w-20 h-10 border-4 border-green-500 rounded">
                    <FaCheckCircle className="w-6 h-6 text-green-500" />
                </div>
            )}
        </>
    )
}