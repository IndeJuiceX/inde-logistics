'use client';

import { useRouter, useParams } from 'next/navigation';

export default function CreateOrderOptionsPage() {
  const router = useRouter();
  const { vendorId } = useParams();  // Get vendorId from route

  const options = [
    {
      title: 'Upload Orders File',
      description: 'Upload a JSON file to quickly create your Orders.',
      buttonText: 'Upload File',
      href: `/vendor/${vendorId}/orders/create/upload`,
    },
    {
      title: 'Create Orders Manually',
      description: 'Use the interface to build your Order step by step.',
      buttonText: 'Create Manually',
      href: `/vendor/${vendorId}/orders/create/manual`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Create Order</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option) => (
            <div key={option.title} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4">{option.title}</h2>
                <p className="text-gray-700 mb-6">{option.description}</p>
              </div>
              <button
                onClick={() => router.push(option.href)}
                className="mt-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                {option.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}