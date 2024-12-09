'use client';

import { usePackingAppContext } from '@/contexts/PackingAppContext';
import { extractNameFromEmail } from '@/services/utils';

export default function PackingFooter() {
    const { order } = usePackingAppContext();
    const email = order?.shipment?.packer ?? null;
    const name = email ? extractNameFromEmail(email) : 'Ali B';

    return (
        <footer className="bg-slate-100 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-2 px-4 flex justify-between items-center h-[60px]">
            <div>
                <p className="font-semibold text-sm">{name}</p>
            </div>
            <div className="mt-2">
                {/* TODO: Add any packing-specific actions/buttons here */}
            </div>
        </footer>
    );
}