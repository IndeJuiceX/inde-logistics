

import React from 'react';
import { useEffect, useState, useContext } from "react";
import { LoadingContext } from '@/contexts/LoadingContext';

export default function MissingItem({ products }) {
    // loading state
    const { setLoading, setLoaded } = useContext(LoadingContext);

    const [expandedRow, setExpandedRow] = useState(null);

    const toggleExpand = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    useEffect(() => {
        console.log('products', products);

        setLoading(false);
        setLoaded(true);
    }, [products]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow-md">
                <thead>
                    <tr>
                        <th className="px-6 py-4 text-left text-gray-600 font-semibold border-b">Product Image</th>
                        <th className="px-6 py-4 text-left text-gray-600 font-semibold border-b">Product Name</th>
                        <th className="px-6 py-4 text-left text-gray-600 font-semibold border-b">Quantity</th>
                        <th className="px-6 py-4 text-left text-gray-600 font-semibold border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <React.Fragment key={product.id}>
                            <tr className="hover:bg-gray-100">
                                <td className="px-6 py-4 border-b">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                                </td>
                                <td className="px-6 py-4 border-b text-gray-700">{product.name}</td>
                                <td className="px-6 py-4 border-b text-gray-700">{product.quantity}</td>
                                <td className="px-6 py-4 border-b">
                                    <button
                                        className="text-blue-500 font-medium hover:underline"
                                        onClick={() => toggleExpand(index)}
                                    >
                                        {expandedRow === index ? "Show Less" : "Show More"}
                                    </button>
                                </td>
                            </tr>
                            {expandedRow === index && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 border-b bg-gray-50">
                                        <div className="p-4">
                                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Additional Details</h4>
                                            <p className="text-gray-600">
                                                <span className="font-semibold">Attributes:</span> {product.attributes}
                                            </p>
                                            <p className="text-gray-600 mt-2">
                                                <span className="font-semibold">Current Stock:</span> {product.currentStock}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
