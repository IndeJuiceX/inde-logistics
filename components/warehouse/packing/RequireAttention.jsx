'use client';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AlertTriangle } from 'lucide-react';
import { FaBox, FaExclamationTriangle, FaQuestionCircle, FaTag, FaTint } from 'react-icons/fa';

export default function RequireAttention() {
    const { addToRequireAttentionQueue } = usePackingAppContext();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div
                    className="flex items-center justify-center gap-3 p-4 rounded-lg text-center font-bold cursor-pointer 
                              bg-white h-[70px] flex-1 border border-gray-200 shadow-sm hover:border-red-500 
                              transition-all duration-300 group"
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle
                            className="w-6 h-6 text-red-500 transition-transform group-hover:scale-110"
                            strokeWidth={2}
                        />
                        <span className="text-gray-700 tracking-wide">REQUIRES ATTENTION</span>
                    </div>
                </div>
            </SheetTrigger>
            <SheetContent className="bg-white w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="text-sm uppercase text-red-500 font-bold text-center">
                        Select Problem
                    </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            className="flex flex-col items-center justify-center p-6 bg-white text-gray-700 
                                     font-bold rounded-lg shadow-sm border border-gray-200 hover:border-red-500 
                                     transition-colors"
                            onClick={() => addToRequireAttentionQueue('Missing Item')}
                        >
                            <FaBox className="text-3xl mb-2 text-gray-400" />
                            <span className="text-sm">Missing Item</span>
                        </button>
                        <button
                            className="flex flex-col items-center justify-center p-6 bg-white text-gray-700 
                                     font-bold rounded-lg shadow-sm border border-gray-200 hover:border-red-500 
                                     transition-colors"
                            onClick={() => addToRequireAttentionQueue('Bottle Leaking')}
                        >
                            <FaTint className="text-3xl mb-2 text-gray-400" />
                            <span className="text-sm">Bottle Leaking</span>
                        </button>
                        <button
                            className="flex flex-col items-center justify-center p-6 bg-white text-gray-700 
                                     font-bold rounded-lg shadow-sm border border-gray-200 hover:border-red-500 
                                     transition-colors"
                            onClick={() => addToRequireAttentionQueue('Requires Larger Parcel')}
                        >
                            <FaExclamationTriangle className="text-3xl mb-2 text-gray-400" />
                            <span className="text-sm">Larger Parcel</span>
                        </button>
                        <button
                            className="flex flex-col items-center justify-center p-6 bg-white text-gray-700 
                                     font-bold rounded-lg shadow-sm border border-gray-200 hover:border-red-500 
                                     transition-colors"
                            onClick={() => addToRequireAttentionQueue('Label Error')}
                        >
                            <FaTag className="text-3xl mb-2 text-gray-400" />
                            <span className="text-sm">Label Error</span>
                        </button>
                        <button
                            className="flex flex-col items-center justify-center p-6 bg-white text-gray-700 
                                     font-bold rounded-lg shadow-sm border border-gray-200 hover:border-red-500 
                                     transition-colors col-span-2"
                            onClick={() => addToRequireAttentionQueue('Other')}
                        >
                            <FaQuestionCircle className="text-3xl mb-2 text-gray-400" />
                            <span className="text-sm">Other</span>
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}