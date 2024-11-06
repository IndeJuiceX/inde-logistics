import { useState } from 'react';

export default function DropdownSearch({
    data,
    onSelectionChange,
    displayFields,
    searchFields,
    valueField
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null); // Single selected item
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleItemClick = (product) => {
        setSelectedItem(product);
        onSelectionChange(product); // Pass selected item to parent
        setIsDropdownVisible(false); // Close dropdown after selection
    };

    // Filter data based on search term and search fields
    const filteredData = data.filter((product) =>
        searchFields.some((field) =>
            product[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const toggleDropdown = () => {
        setIsDropdownVisible((prev) => !prev);
    };

    return (
        <div className="relative w-60">
            <h1 className="text-black-700">Select the Brand</h1>
            <button
                onClick={toggleDropdown}
                className="w-full text-left bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {selectedItem ? (
                    displayFields.map((field) => selectedItem[field]).join(', ')
                ) : (
                    'Select products'
                )}
                <svg
                    className="w-5 h-5 ml-2 inline-block"
                    fill="none"
                    viewBox="0 0 10 6"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                    />
                </svg>
            </button>

            {isDropdownVisible && (
                <div className="absolute z-10 w-full bg-white rounded-lg shadow-lg mt-1 border border-gray-300 max-h-60 overflow-auto">
                    <div className="p-3">
                        <label className='text-black-800'></label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search products"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <ul className="text-sm text-gray-700">
                        {filteredData.length > 0 ? (
                            filteredData.map((product) => (
                                <li key={product[valueField]}>
                                    <div
                                        onClick={() => handleItemClick(product)}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <span className="ml-2 text-gray-800">
                                            {displayFields.map((field, idx) => (
                                                <span key={idx}>{product[field]} </span>
                                            ))}
                                        </span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-gray-500">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
