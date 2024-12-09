'use client'

import { useState } from "react";
import { useGlobalContext } from "@/contexts/GlobalStateContext";

export default function BrandFilter({ setSelectedBrand, selectedBrand }) {
    const { globalProducts } = useGlobalContext();

    const [search, setSearch] = useState(selectedBrand);
    const [filteredData, setFilteredData] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const brand_names = globalProducts && globalProducts.length > 0
        ? [...new Set(globalProducts.map(product => product.brand_name))]
        : [];

    const handleSearch = (value) => {
        setShowDropdown(true);
        setSearch(value);
        if (brand_names.length > 0) {
            setFilteredData(brand_names.filter(item => typeof item === 'string' && item.toLowerCase().includes(value.toLowerCase())));
        }
    }
    const handleBrandClick = (brand) => {
        setSearch(brand);
        setSelectedBrand(brand);
        setShowDropdown(false);
    }
    const handleClear = () => {
        setSearch('');
        setFilteredData([]);
        setShowDropdown(false);
        setSelectedBrand('');
    }
    return (
        <div className="relative w-full mx-auto mt-2">
            {/* Search Box */}
            <div className="bg-gray-700 text-white px-4 py-3 rounded-md w-full flex items-center">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                    className="bg-gray-700 text-white outline-none w-full"
                />
                <button
                    onClick={handleClear}
                    className="ml-2 text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                >
                    Clear
                </button>
            </div>

            {/* Filtered Results */}
            {showDropdown && (
                <div className="mt-2">
                    {filteredData.length > 0 && filteredData.map((item, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 bg-white text-black rounded-md mb-2"
                            onClick={() => handleBrandClick(item)}
                        >
                            {item}
                        </div>
                    ))}
                    {filteredData.length === 0 && (
                        <div className="px-4 py-2 bg-white text-black rounded-md mb-2">
                            No results found
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
