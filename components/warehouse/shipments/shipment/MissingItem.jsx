


import React, { useLayoutEffect } from 'react';
import { useEffect, useState, useContext } from "react";
import { GlobalStateContext } from '@/contexts/GlobalStateContext';
import DropdownSearch from '@/components/warehouse/dropdown/DropdownSearch';

export default function MissingItem({ products }) {
    // loading state
    const { setLoading, setLoaded } = useContext(GlobalStateContext);

    const [expandedRow, setExpandedRow] = useState(null);

    const toggleExpand = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    useEffect(() => {
        console.log('products', products);
    }, [products]);

    useLayoutEffect(() => {
        setLoading(false);
        setLoaded(true);
    }, [setLoading, setLoaded]);

    const displayFields = ['name']; // Fields to show in the dropdown
    const searchFields = ['name']; // Fields to search
    const valueField = 'id'; // Field to be returned when item is selected
    const sampleData = [
        { id: 1, name: 'news', status: 'Active', brand_name: 'Ultimate' },
        { id: 2, name: 'apple', status: 'Active', brand_name: 'Ultimate Juice vape' },
        { id: 3, name: 'mango', status: 'Active', brand_name: 'ivg ' },
        { id: 4, name: 'banana', status: 'Active', brand_name: 'ivg' },
        { id: 5, name: 'samsung', status: 'Active', brand_name: 'elf bar' },
        { id: 6, name: 'apple pie', status: 'Active', brand_name: 'elf bar' },
        { id: 7, name: 'banana ice', status: 'Active', brand_name: 'doozy' },
        { id: 8, name: 'watermelon', status: 'Active', brand_name: 'doozy' },
        { id: 9, name: 'watermelon ice', status: 'Active', brand_name: 'doozy' },
        { id: 10, name: 'lemon', status: 'Active', brand_name: 'doozy' },
        { id: 11, name: 'lemonade', status: 'Active', brand_name: 'doozy' },
        { id: 12, name: 'blueberry', status: 'Active', brand_name: 'Ultimate Juice' },
    ];
    const handleSelectionChange = (selectedItems) => {
        console.log('selectedItems', selectedItems);
    }
    return (
        <div className="overflow-x-auto overflow-y-scroll h-[80%]">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Missing Items</h2>
            {/* product search box */}

            <DropdownSearch
                data={sampleData}
                onSelectionChange={handleSelectionChange}
                displayFields={displayFields}
                searchFields={searchFields}
                valueField={valueField}
            />

            <div className="mb-4"></div>


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
                        <React.Fragment key={index}>
                            <tr className="hover:bg-gray-100">
                                <td className="px-6 py-4 border-b">
                                    {/* eslint-disable-next-line */}
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
