'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import ItemsInShipment from '@/components/ItemsInShipment';
import ProductList from '@/components/ProductList';
import PaginationControls from '@/components/PaginationControls';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';

export default function EditStockShipment({ vendorId, stockShipmentId }) {
    const router = useRouter();

    // State variables
    const [products, setProducts] = useState([]); // Products to display
    const [selectedItems, setSelectedItems] = useState([]); // Selected products with quantities
    const [searchTerm, setSearchTerm] = useState(''); // User input for search
    const [query, setQuery] = useState(''); // Actual search query used for API
    const [brands, setBrands] = useState([]); // Available brands for filtering
    const [selectedBrands, setSelectedBrands] = useState([]); // Selected brands for filtering
    const [brandSearchTerm, setBrandSearchTerm] = useState(''); // Search term for brands
    const [loading, setLoading] = useState(true); // Loading state for products
    const [error, setError] = useState(null); // Error state for products
    const [page, setPage] = useState(1); // Current page for pagination
    const [totalPages, setTotalPages] = useState(0); // Total number of pages
    const [totalResults, setTotalResults] = useState(0); // Total number of results
    const pageSize = 30; // Products per page
    const [loadingShipment, setLoadingShipment] = useState(true); // Loading state for shipment data
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);

    const fetchProducts = async (startKey = null) => {
        try {

            let url = `/api/v1/vendor/products?page_size=${pageSize}`;
            if (startKey) {
                url += `&lastEvaluatedKey=${encodeURIComponent(startKey)}`;
            }
            const response = await fetch(url, {
                method: 'GET',
                cache: 'no-store',
            });
            const data = await response.json();

            setProducts(data.data)

            setLastEvaluatedKey(data.lastEvaluatedKey);
            setLoading(false)
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };
    useEffect(() => {
        if (vendorId) {
            fetchProducts(lastEvaluatedKey);
        }
    }, [vendorId, lastEvaluatedKey]);

    // Fetch existing shipment data on mount
    useEffect(() => {
        const fetchShipmentData = async () => {
            setLoadingShipment(true);
            try {
                // const response = await fetch(
                //   `/api/v1/vendor/stock-shipments/${stockShipmentId}?vendorId=${vendorId}`
                // );
                const response = await fetch(
                    `/api/v1/vendor/stock-shipments?stock_shipment_id=${stockShipmentId}`
                );
                const data = await response.json();

                if (response.ok && data.success) {
                    // Extract shipment items and populate selectedItems
                    const  stock_shipment_items  = data.data.items;
                    const existingItems = stock_shipment_items.map((item) => ({
                        ...item,
                        quantity: item.quantity, // Ensure to include quantity
                    }));
                    setSelectedItems(existingItems);
                } else {
                    console.error('Error fetching shipment data:', data.error);
                    // Handle error (e.g., show a message or redirect)
                }
            } catch (error) {
                console.error('Error fetching shipment data:', error);
                // Handle error
            } finally {
                setLoadingShipment(false);
            }
        };

        if (vendorId && stockShipmentId) {
            fetchShipmentData();
        }
    }, [vendorId, stockShipmentId]);

    // Handle product selection (Add or Update Item)
    const handleSelectProduct = async (product, quantity) => {
        if (quantity <= 0) return; // Ensure quantity is greater than 0

        // Check if the item exists in the selectedItems
        const existingItem = selectedItems.find(
            (item) => item.vendor_sku === product.vendor_sku
        );

        const requestBody = {
            // stock_shipment: {
                stock_shipment_id: stockShipmentId,
                items: [
                    {
                        vendor_sku: product.vendor_sku,
                        stock_in: quantity,
                    },
                ],
            // },
        };

        if (existingItem) {
            // Item exists, update the quantity
            try {
                const response = await fetch(
                    `/api/v1/vendor/stock-shipments/update-item?stock_shipment_id=${stockShipmentId}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    }
                );

                const result = await response.json();

                if (response.ok) {
                    // Update the quantity in selectedItems state
                    setSelectedItems((prev) =>
                        prev.map((item) =>
                            item.vendor_sku === product.vendor_sku
                                ? { ...item, quantity }
                                : item
                        )
                    );
                } else {
                    alert(`Failed to update item: ${result.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error updating item:', error);
                alert('An error occurred while updating the item.');
            }
        } else {
            // Item does not exist, add it
            try {
                const response = await fetch(
                    `/api/v1/vendor/stock-shipments/add-item?stock_shipment_id=${stockShipmentId}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    }
                );

                const result = await response.json();

                if (response.ok) {
                    // Add new product to the selected items
                    setSelectedItems((prev) => [...prev, { ...product, quantity }]);
                } else {
                    alert(`Failed to add item: ${result.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error adding item:', error);
                alert('An error occurred while adding the item.');
            }
        }
    };

    // Handle product removal (Remove Item)
    const handleRemoveProduct = async (vendor_sku) => {
        const requestBody = {
            // stock_shipment: {
                stock_shipment_id: stockShipmentId,
                items: [vendor_sku],
            // },
        };

        try {
            const response = await fetch(
                `/api/v1/vendor/stock-shipments/delete?stock_shipment_id=${stockShipmentId}`,
                {
                    method: 'DELETE', // Assuming POST for remove
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            const result = await response.json();

            if (response.ok) {
                // Remove product from selectedItems state
                setSelectedItems((prev) =>
                    prev.filter((item) => item.vendor_sku !== vendor_sku)
                );
            } else {
                alert(`Failed to remove item: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('An error occurred while removing the item.');
        }
    };

    // Handle brand checkbox change
    const handleBrandCheckboxChange = (brand) => {
        setPage(1); // Reset to first page when filter changes
        setSelectedBrands((prevSelectedBrands) => {
            if (prevSelectedBrands.includes(brand)) {
                // Remove brand from selectedBrands
                return prevSelectedBrands.filter((b) => b !== brand);
            } else {
                // Add brand to selectedBrands
                return [...prevSelectedBrands, brand];
            }
        });
    };

    // Handle product search
    const handleProductSearch = () => {
        setPage(1); // Reset to first page
        setQuery(searchTerm); // Set the query to trigger API call
    };

    // Handle clearing the search
    const handleClearSearch = () => {
        setSearchTerm(''); // Clear the search input
        setQuery(''); // Clear the query to fetch all products
        setPage(1); // Reset to first page
    };

    // If the shipment data is still loading, show a loading indicator
    if (loadingShipment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading shipment data...</div>
            </div>
        );
    }
    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Stock Shipments', url: `/vendor/${vendorId}/stock-shipments` },
        { text: 'Edit Stock Shipment' },
    ];
    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    {/* Header and Search */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Edit Stock Shipment</h1>
                            <p className="text-gray-600 mt-2">
                                Editing Shipment ID:{' '}
                                <span className="font-semibold">{stockShipmentId}</span>
                            </p>
                        </div>
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            onSearch={handleProductSearch}
                            onClear={handleClearSearch}
                        />
                    </div>

                    {/* Applied Filters */}
                    {selectedBrands.length > 0 && (
                        <div className="mb-6 flex flex-wrap items-center">
                            <span className="mr-2 font-semibold">Filters Applied:</span>
                            {selectedBrands.map((brand) => (
                                <div
                                    key={brand}
                                    className="flex items-center mr-2 mb-2 bg-blue-100 px-3 py-1 rounded-full"
                                >
                                    <span className="text-blue-700">{brand}</span>
                                    <button
                                        onClick={() => handleBrandCheckboxChange(brand)}
                                        className="ml-2 text-blue-700 hover:text-blue-900 font-bold"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Content with Filters and Items in Shipment Column */}
                    <div className="mt-6 flex flex-col md:flex-row">
                        {/* Left Column: Filters and Items in Shipment */}
                        <div className="md:w-1/4 md:pr-4 mb-6 md:mb-0">
                            {/* Filters 
            <Filters
              brands={brands}
              selectedBrands={selectedBrands}
              handleBrandCheckboxChange={handleBrandCheckboxChange}
              brandSearchTerm={brandSearchTerm}
              setBrandSearchTerm={setBrandSearchTerm}
            />*/}

                            {/* Items in Shipment */}
                            <ItemsInShipment
                                selectedItems={selectedItems}
                                handleRemoveProduct={handleRemoveProduct}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="md:w-3/4">
                            {/* Display "Results for 'SearchTerm'" */}
                            {query && (
                                <p className="mb-4 text-gray-700">
                                    Results for &quot;<span className="font-semibold">{query}</span>
                                    &quot;
                                </p>
                            )}

                            {/* Product List or Loading/Error Messages */}
                            {loading ? (
                                <p>Loading products...</p>
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : products.length === 0 ? (
                                <p>No products found. Try adjusting your search or filters.</p>
                            ) : (
                                <>
                                    {/* Product List */}
                                    <ProductList
                                        products={products}
                                        selectedItems={selectedItems}
                                        handleSelectProduct={handleSelectProduct}
                                    />

                                    {/* Pagination Controls */}
                                    <PaginationControls
                                        page={page}
                                        totalPages={totalPages}
                                        setPage={setPage}
                                        totalResults={totalResults}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}