'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';

export default function ProductDashboard({ vendorId }) {

    const router = useRouter();

    const [totalProducts, setTotalProducts] = useState(0);
    const [loadingCount, setLoadingCount] = useState(true);

    useEffect(() => {
        if (vendorId) {
            const fetchTotalProducts = async () => {
                try {
                    const response = await fetch(`/api/v1/admin/vendor/products/count?vendor_id=${vendorId}`);
                    const data = await response.json();
                    setTotalProducts(data.count);
                    setLoadingCount(false);
                } catch (error) {
                    console.error('Error fetching total products count:', error);
                    setLoadingCount(false);
                }
            };

            fetchTotalProducts();
        }
    }, [vendorId]);
    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Catalogue', url: `/vendor/${vendorId}/dashboard` }
    ];
    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />


            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        Manage Your Catalogue
                    </h1>

                    {/* Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Products Count Card */}
                        <div
                            className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-center items-center h-full cursor-pointer hover:shadow-lg transition"
                            onClick={() => router.push(`/vendor/${vendorId}/products/all`)}
                        >
                            <h2 className="text-xl font-semibold text-gray-800">Products Count</h2>
                            {loadingCount ? (
                                <p className="text-gray-600 mt-2">Loading...</p>
                            ) : (
                                <p className="text-4xl font-bold text-gray-900 mt-2">{totalProducts}</p>
                            )}
                            <p className="text-gray-600 mt-1">Click to view all products</p>
                        </div>

                        {/* Add Product Card */}
                        <Link href={`/vendor/${vendorId}/products/upload`} className="block h-full">
                            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-center items-center h-full cursor-pointer hover:shadow-lg transition">
                                <h2 className="text-xl font-semibold text-gray-800">Add New Products</h2>
                                <p className="text-gray-600 mt-2">Click to Upload Products</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
