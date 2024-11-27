'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import VendorMenu from '@/components/admin/VendorMenu'; // Adjust the import path as needed
import { getFileFromS3 } from '@/services/external/s3';
import Link from 'next/link';

export default function ProductDetails({ productData, vendorId, productId }) {


    const router = useRouter();
    const [vendorName, setVendorName] = useState('Vendor'); // State for vendor name
    const [product, setProduct] = useState(productData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [expandedHistory, setExpandedHistory] = useState({});



    //   // Fetch product data
    //   useEffect(() => {
    //     const fetchProduct = async () => {
    //       try {
    //         // const response = await fetch(`/api/v1/admin/vendor/${vendorId}/product/${productId}`, {
    //         //   method: 'GET',
    //         //   cache: 'no-store', // Disable cache
    //         // });
    //         // const data = await response.json();
    //         const data = await getProductById(vendorId, productId);
    //         console.log('Product data:', data);
    //         setProduct(data); // Populate product data
    //         setLoading(false);
    //       } catch (err) {
    //         setError('Error fetching product data');
    //         setLoading(false);
    //       }
    //     };

    //     if (vendorId && productId) {
    //       fetchProduct();
    //     }
    //   }, [vendorId, productId]);

    // Fetch history when the user clicks the "View Version History" button
    const handleViewHistory = async () => {
        setShowHistory(!showHistory); // Toggle the display of the history section
        if (!showHistory && product?.history) {
            setHistoryLoading(true);
            try {
                const sortedHistory = [...product.history].sort((a, b) => {
                    const aVersion = parseInt(a.match(/product-(\d+)\.json$/)[1], 10);
                    const bVersion = parseInt(b.match(/product-(\d+)\.json$/)[1], 10);
                    return bVersion - aVersion; // Sort in descending order
                });
                setHistory(sortedHistory);
                setHistoryLoading(false);
            } catch (err) {
                setHistoryError('Error fetching history');
                setHistoryLoading(false);
            }
        }
    };

    // Fetch the content of a history object when expanded
    const handleExpandHistory = async (s3Link) => {
        setExpandedHistory((prev) => ({ ...prev, [s3Link]: !prev[s3Link] })); // Toggle expanded state

        if (!expandedHistory[s3Link]) {
            try {
                // Call getFileFromS3 directly instead of fetching from an API
                const fileContent = await getFileFromS3(s3Link);

                // Parse the file content if necessary (assuming it's JSON)
                const parsedContent = JSON.parse(fileContent);
                // Function to recursively remove 'pk' and 'sk' from an object or array
                const removeKeys = (obj) => {
                    if (Array.isArray(obj)) {
                        obj.forEach(removeKeys);
                    } else if (typeof obj === 'object' && obj !== null) {
                        delete obj.pk;
                        delete obj.sk;
                        Object.values(obj).forEach(removeKeys);
                    }
                };

                // Remove 'pk' and 'sk' fields from the parsed content
                removeKeys(parsedContent);

                setExpandedHistory((prev) => ({ ...prev, [s3Link]: parsedContent }));
            } catch (err) {
                console.error('Error fetching S3 object', err);
            }
        }
    };

    if (loading) {
        return <p className="text-center text-lg">Loading product details...</p>;
    }
    if (error) {
        return <p className="text-center text-red-600">{error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto">
                {/* Vendor Menu */}
                <VendorMenu vendorId={vendorId} />

                {/* Main Content */}
                <div className="bg-white shadow-md rounded-lg p-8 mt-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800">Product Details</h1>
                       
                        <Link href={`/admin/vendors/${vendorId}/products/${productId}/edit`} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200">
                            Edit Product
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Product Image */}
                        <div>
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={500}
                                    height={500}
                                    className="object-cover rounded-md w-full h-auto"
                                />
                            ) : (
                                <p className="text-gray-500">No image available</p>
                            )}
                        </div>

                        {/* Product Details */}
                        <div>
                            <div className="mb-4">
                                <p className="text-lg text-gray-600">
                                    <strong>Name:</strong> {product.name}
                                </p>
                            </div>
                            <div className="mb-4">
                                <p className="text-lg text-gray-600">
                                    <strong>Vendor SKU:</strong> {product.vendor_sku}
                                </p>
                            </div>
                            <div className="mb-4">
                                <p className="text-lg text-gray-600">
                                    <strong>Brand Name:</strong> {product.brand_name}
                                </p>
                            </div>
                            <div className="mb-4">
                                <p className="text-lg text-gray-600">
                                    <strong>Price:</strong> £{product.sale_price}
                                </p>
                            </div>
                            <div className="mb-4">
                                <p className="text-lg text-gray-600">
                                    <strong>Stock:</strong> {product.stock_available}
                                </p>
                            </div>
                            <div className="mb-4">
                                <p className="text-lg text-gray-600">
                                    <strong>Status:</strong> {product.status}
                                </p>
                            </div>
                            <div className="mb-4">
                                <p className="text-lg text-gray-600">
                                    <strong>Cost Price:</strong> £{product.cost_price}
                                </p>
                            </div>

                            {/* Attributes Section */}
                            {product.attributes && (
                                <div className="mb-4">
                                    <p className="text-lg text-gray-600">
                                        <strong>Attributes:</strong>
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600">
                                        {Object.entries(product.attributes).map(([key, value]) => (
                                            <li key={key}>
                                                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* View History Button */}
                    <div className="mt-6">
                        <button
                            onClick={handleViewHistory}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                        >
                            {showHistory ? 'Hide Version History' : 'View Version History'}
                        </button>
                    </div>

                    {/* Version History Section */}
                    {showHistory && (
                        <div className="mt-6">
                            {historyLoading ? (
                                <p className="text-gray-600">Loading history...</p>
                            ) : historyError ? (
                                <p className="text-red-600">{historyError}</p>
                            ) : history.length > 0 ? (
                                <ul className="space-y-4">
                                    {history.map((s3Link) => (
                                        <li key={s3Link}>
                                            <div className="flex justify-between items-center">
                                                <p className="text-gray-600">
                                                    {s3Link.split('/').pop()}{' '}
                                                    {/* Display the last part of the S3 link */}
                                                </p>
                                                <button
                                                    onClick={() => handleExpandHistory(s3Link)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    {expandedHistory[s3Link] ? 'Hide' : 'View'}
                                                </button>
                                            </div>

                                            {/* Render expanded history object */}
                                            {expandedHistory[s3Link] && (
                                                <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto">
                                                    {JSON.stringify(expandedHistory[s3Link], null, 2)}
                                                </pre>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600">No version history available</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}