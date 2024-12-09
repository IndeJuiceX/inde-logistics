'use client';
import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { Printer } from 'lucide-react';

export default function LabelPrintButton() {
    const { printLabel, isGeneratedLabel } = usePackingAppContext();

    return (
        <div
            className="flex items-center justify-center gap-3 p-4 rounded-lg text-center font-bold cursor-pointer 
                      bg-white h-[70px] w-full border border-gray-200 shadow-sm hover:border-blue-500 
                      transition-all duration-300 group"
            onClick={printLabel}
        >
            <Printer
                className="w-6 h-6 text-gray-400 transition-transform group-hover:scale-110"
                strokeWidth={2}
            />
            <span className="text-gray-700 tracking-wide">
                {isGeneratedLabel ? 'REPRINT LABEL' : 'PRINT LABEL'}
            </span>
        </div>
    );
}