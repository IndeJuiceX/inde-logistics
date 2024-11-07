'use client';

import { useEffect, useState, useContext } from 'react';
// import { GlobalStateContext } from '@/contexts/GlobalStateContext';


export default function SearchableDropdown({ products, onSelectedBrand }) {
    // const { globalProducts } = useContext(GlobalStateContext);

    const [query, setQuery] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);

    // const options = [
    //     'Apple',
    //     'Banana',
    //     'Cherry',
    //     'Date',
    //     'Elderberry',
    //     'Fig',
    //     'Grape',
    // ];

    // Filter options based on the query
    // const filteredOptions = options.filter((option) =>
    //     option.toLowerCase().includes(query.toLowerCase())
    // );

    const uniqueBrands = [...new Set(products.map(item => item.brand_name).filter(Boolean))];

    const filteredOptions = uniqueBrands.filter((brand) =>
        brand.toLowerCase().includes(query.toLowerCase())
    );

    const handleSearchTerm = (value) => {
        setQuery(value);
        setSelectedOption(null);
    }

    const handleSelectOption = (option) => {
        setQuery(option);
        setSelectedOption(option);
        onSelectedBrand(option);
    }

    // useEffect(() => {
    //     console.log('globalProducts', globalProducts);
    // }, [globalProducts]);

    return (
        <div className="flex items-center justify-center">
            <div className="relative w-64">
                {/* Label */}
                <label
                    htmlFor="search"
                    className="block mb-2 text-sm font-medium text-black"
                >
                    Select the brand
                </label>

                {/* Input for search */}
                <input
                    id="search"
                    type="text"
                    value={query}
                    onChange={(e) => handleSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-black"
                    autoComplete="off"
                />

                {/* Dropdown - only show if query is not empty */}
                {query && filteredOptions.length > 0 && !selectedOption && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1 text-black">
                        {filteredOptions.map((option, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelectOption(option)}
                                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                )}

                {/* No options found */}
                {query && filteredOptions.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500">No options found.</p>
                )}
            </div>
        </div>
    );
}
