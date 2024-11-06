import { useEffect, useState } from 'react';

export default function DropdownSearch({ data, onSelectionChange, displayFields, searchFields, valueField }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCheckboxChange = (product, isChecked) => {
        const updatedSelectedItems = isChecked
            ? [...selectedItems, product]
            : selectedItems.filter((item) => item[valueField] !== product[valueField]);

        setSelectedItems(updatedSelectedItems);
        onSelectionChange(updatedSelectedItems); // Pass updated selection to parent
    };

    // Filter data based on search term and search fields
    const filteredData = data.filter((product) =>
        searchFields.some((field) =>
            product[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    // Toggle dropdown visibility
    const toggleDropdown = () => {
        
        setIsDropdownVisible((prev) => !prev);
    };

    useEffect(() => {
        console.log('isDropdownVisible', isDropdownVisible);
    }, [isDropdownVisible]);

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown} // Toggle visibility on click
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                type="button"
            >
                Dropdown search
                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>
            {isDropdownVisible && (
                <div id="dropdownSearch" className={`z-10  bg-white rounded-lg shadow w-60 ${isDropdownVisible?? 'hidden'}`}>
                    <div className="p-3">
                        <input
                            type="text"
                            id="input-group-search"
                            className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg"
                            placeholder="Search products"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <ul className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700">
                        {filteredData.map((product, index) => (
                            <li key={index}>
                                <div className="flex items-center ps-2 rounded hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.some((item) => item[valueField] === product[valueField])}
                                        onChange={(e) => handleCheckboxChange(product, e.target.checked)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                    />
                                    <label className="w-full py-2 ms-2 text-sm font-medium text-gray-900">
                                        {/* Show the fields based on the displayFields parameter */}
                                        {displayFields.map((field) => (
                                            <span key={field}>{product[field]} </span>
                                        ))}
                                    </label>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
