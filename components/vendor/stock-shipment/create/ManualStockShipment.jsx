'use client'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ItemsInShipment from '@/components/ItemsInShipment';
import ProductList from '@/components/ProductList';
import PaginationControls from '@/components/PaginationControls';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
import ProductSearchByFields from '@/components/vendor/product/ProductSearchByFields';

export default function ManualStockShipment({ vendorId }) {
    const router = useRouter();

    // State variables
    const [products, setProducts] = useState([]);                  // Products to display
    const [selectedItems, setSelectedItems] = useState([]);        // Selected products with quantities
    const [searchTerm, setSearchTerm] = useState('');              // User input for search
    const [query, setQuery] = useState('');                        // Actual search query used for API
    const [brands, setBrands] = useState([]);                      // Available brands for filtering
    const [selectedBrands, setSelectedBrands] = useState([]);      // Selected brands for filtering
    const [brandSearchTerm, setBrandSearchTerm] = useState('');    // Search term for brands
    const [selectedQuantity, setSelectedQuantity] = useState({});  // Quantity for each product
    const [loading, setLoading] = useState(true);                  // Loading state for products
    const [error, setError] = useState(null);                      // Error state for products
    const [page, setPage] = useState(1);                           // Current page for pagination
    const [totalPages, setTotalPages] = useState(0);               // Total number of pages
    const [totalResults, setTotalResults] = useState(0);           // Total number of results
    const pageSize = 30;                                           // Products per page
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [hasMore, setHasMore] = useState(true);                  // More products available
    const observerRef = useRef(null);

    const fetchProducts = async (lastEvaluatedKey = null) => {
        try {
            let url = `/api/v1/vendor/products?page_size=${pageSize}`;

            if (lastEvaluatedKey) {
                url += `&last_evaluated_key=${encodeURIComponent(lastEvaluatedKey)}`;
            }
            const response = await fetch(url, {
                method: 'GET',
                cache: 'no-store',
            });
            const data = await response.json();

            setProducts((prevProducts) => [...prevProducts, ...data.data]);
            console.log('data', data.last_evaluated_key);

            setLastEvaluatedKey(data.last_evaluated_key);
            setHasMore(!!data.last_evaluated_key);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    };

    // Fetch vendor products with pagination and search
    useEffect(() => {
        if (vendorId) {
            // Reset products and lastEvaluatedKey when vendorId changes or on initial load
            setProducts([]);
            setLastEvaluatedKey(null);
            fetchProducts();
        }
    }, [vendorId]);

    useEffect(() => {
        const options = {
            root: null, // viewport
            rootMargin: '20px',
            threshold: 1.0,
        };
        const handleObserver = (entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore) {
                fetchProducts(lastEvaluatedKey);
            }
        };
        observerRef.current = new IntersectionObserver(handleObserver, options);
        if (observerRef.current) {
            const sentinel = document.querySelector('#scroll-sentinel');
            if (sentinel) {
                observerRef.current.observe(sentinel);
            }
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [hasMore, lastEvaluatedKey]);


    ////=========================================================

    // Handle quantity input change
    const handleQuantityChange = (product, quantity) => {
        setSelectedQuantity((prev) => ({
            ...prev,
            [product.vendor_sku]: Math.max(1, quantity), // Ensure minimum value is 1
        }));
    };

    // Handle product selection
    const handleSelectProduct = (product, quantity) => {
        if (quantity <= 0) return; // Ensure quantity is greater than 0
        setSelectedItems((prev) => {
            const existingItem = prev.find((item) => item.vendor_sku === product.vendor_sku);
            if (existingItem) {
                // Update the quantity if product already selected
                return prev.map((item) =>
                    item.vendor_sku === product.vendor_sku ? { ...item, quantity } : item
                );
            }
            // Add new product to the selected items
            return [...prev, { ...product, quantity }];
        });
    };

    // Handle product removal
    const handleRemoveProduct = (vendor_sku) => {
        setSelectedItems((prev) => prev.filter((item) => item.vendor_sku !== vendor_sku));
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
        setPage(1);            // Reset to first page
        setQuery(searchTerm);  // Set the query to trigger API call
    };

    // Handle clearing the search
    const handleClearSearch = () => {
        setSearchTerm('');  // Clear the search input
        setQuery('');       // Clear the query to fetch all products
        setPage(1);         // Reset to first page
    };

    // Save the shipment and redirect for final submission
    const handleSaveShipment = async () => {
        if (selectedItems.length === 0) {
            alert('No items selected for shipment.');
            return;
        }

        // Form the stock_shipment array from selectedItems
        const stock_shipment = selectedItems.map((item) => ({
            vendor_sku: item.vendor_sku,
            stock_in: item.quantity,
            // Include other necessary fields if any
        }));
        const requestBody = {
            stock_shipment,
            // Include other necessary data, e.g., shipment metadata
        };

        try {
            // Send the POST request to the backend
            const response = await fetch(
                `/api/v1/vendor/stock-shipments/create`,
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
                // Assuming the backend returns the shipment ID
                const shipmentId = result.shipment_id;
                alert('Stock shipment saved successfully.');
                // Redirect to the shipment page
                router.push(`/vendor/${vendorId}/stock-shipments/${shipmentId}`);
            } else {
                alert(`Failed to save shipment: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving shipment:', error);
            alert('An error occurred while saving the shipment.');
        }
    };
    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Stock Shipments', url: `/vendor/${vendorId}/stock-shipments` },
        { text: 'Create Stock Shipment', url: `/vendor/${vendorId}/stock-shipments/create` },
        { text: 'Manual Stock Shipment' },
    ];

    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    {/* Header and Search */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                        <h1 className="text-3xl font-bold">Create Manual Stock Shipment</h1>
                        {/* <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            onSearch={handleProductSearch}
                            onClear={handleClearSearch}
                        /> */}

                        <ProductSearchByFields
                            vendorId={vendorId}
                            setProducts={setProducts}
                            setTotalProducts={setTotalResults}
                            clearSearch={true}
                            onClearSearch={fetchProducts}
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
                    <div className="flex justify-end mt-8">
                        {totalResults > 0 && (
                            <span className="mr-4 text-gray-700">
                                Total Search Products: {totalResults}
                            </span>
                        )}
                        <button
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                            onClick={handleSaveShipment}
                        >
                            Save Shipment
                        </button>
                    </div>
                    {/* Main Content with Filters and Items in Shipment Column */}
                    <div className="mt-6 flex flex-col md:flex-row">

                        {/* Left Column: Filters and Items in Shipment */}
                        <div className="md:w-1/4 md:pr-4 mb-6 md:mb-0">
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
                                    Results for &quot;<span className="font-semibold">{query}</span>&quot;
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
                                        onSelectionChange={(items) => setSelectedItems(items)}
                                    />

                                    {/* Pagination Controls */}
                                    <PaginationControls
                                        page={page}
                                        totalPages={totalPages}
                                        setPage={setPage}
                                        totalResults={totalResults}
                                    />

                                    {/* Save Shipment Button */}

                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div id="scroll-sentinel" style={{ height: '1px' }}></div>
        </>
    );
}