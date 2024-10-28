'use client';

import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateStockShipment({ vendorId }) {
    const router = useRouter();


    const options = [
        {
            title: 'Upload Stock Shipment File',
            description: 'Upload a JSON file to quickly create your stock shipment.',
            buttonText: 'Upload File',
            href: `/vendor/${vendorId}/stock-shipments/create/upload`,
        },
        {
            title: 'Create Stock Shipment Manually',
            description: 'Use the interface to build your stock shipment step by step.',
            buttonText: 'Create Manually',
            href: `/vendor/${vendorId}/stock-shipments/create/manual`,
        },
    ];

    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Stock Shipments', url: `/vendor/${vendorId}/stock-shipments` },
        { text: 'Create Stock Shipment' },
    ];


    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />

            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8">Create Stock Shipment</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {options.map((option) => (
                            <div key={option.title} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold mb-4">{option.title}</h2>
                                    <p className="text-gray-700 mb-6">{option.description}</p>
                                </div>
                                <Link href={option.href} className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600' >
                                    {option.buttonText}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}