'use client'

import { useState } from 'react';

export default function ProductSearchByFields({ vendorId }) {
    const [searchField, setSearchField] = useState('name'); // State for search field
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    

    const handleSearch = async () => {
        // Implement search functionality here
        // app/api/v1/admin/vendor/products/search/route.js
        const searchResponse = await fetch(`/api/v1/admin/vendor/products/search?vendor_id=${vendorId}&q=${searchTerm}&query_by=${searchField}`);
        const searchResult = await searchResponse.json();
        console.log('Search result:', searchResult);

    };
    return (
        <div className="flex justify-between items-center mb-6">
            {/* Selection Dropdown */}
            <select className="px-4 py-2 border border-gray-300 rounded-md mr-4">
                <option value="name">Product Name</option>
                <option value="vendor_sku">Product SKU</option>
            </select>
            {/* Full-width Search Bar */}
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md mr-4"
            />
            {/* Search and Delete Buttons */}
            <div className="space-x-4">
                <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    onClick={handleSearch}
                >
                    Search
                </button>
                <button
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md">
                    Delete Catalogue
                </button>
            </div>
        </div>
    )
}