
import { useState } from 'react';

export default function ProductSearch({ vendorId, setProducts, setSearchTerm, searchTerm, handleDeleteCatalogue }) {
    const [allProducts, setAllProducts] = useState([]);

    const loadProductsForSearch = async (page = 1, pageSize = 10000000000) => {
        if (allProducts.length > 0) return;
        // setLoading(true);
        try {
            // Include the `page` and `pageSize` in the API call
            const response = await fetch(`/api/v1/admin/vendor/products?vendor_id=${vendorId}&page=${page}&page_size=${pageSize}`);
            const data = await response.json();
            // console.log('Search results:', data);
            setAllProducts(data);
            // Set the products and any pagination data if needed
            // setProducts(data.products);  // Assuming data.products is where the product list is stored
            //setTotalPages(Math.ceil(data.total / pageSize));  // Calculate total pages from the response
            // setLoading(false);
        } catch (error) {
            console.error('Error searching products:', error);
            // setLoading(false);
        }
    };

    function objectContainsValue(obj, searchValue) {
        const valueString = String(searchValue).toLowerCase();
        let found = false;

        function check(innerObj) {
            if (found) return;
            if (typeof innerObj === 'object' && innerObj !== null) {
                for (const key in innerObj) {
                    if (innerObj.hasOwnProperty(key)) {
                        check(innerObj[key]);
                    }
                }
            } else {
                const str = String(innerObj).toLowerCase();
                if (str.includes(valueString)) {
                    found = true;
                }
            }
        }

        check(obj);
        return found;
    }
    const handleSearch = () => {
        // Get the search term
        const inputValue = searchTerm;
        // console.log('inputValue', inputValue);

        // Filter products based on the search term
        const matched = allProducts.filter(product =>
            objectContainsValue(product, inputValue)
        );

        // Log matching products to the console
        matched.forEach(product => console.log(product));
        setProducts(
            matched
        )
    }

    return (
        <div className="flex justify-between items-center mb-6">
            {/* Full-width Search Bar */}
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md mr-4"
                onClick={loadProductsForSearch}
            />
            {/* Search and Delete Buttons */}
            <div className="space-x-4">
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                    Search
                </button>
                <button
                    onClick={handleDeleteCatalogue}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md">
                    Delete Catalogue
                </button>
            </div>
        </div>
    )
}