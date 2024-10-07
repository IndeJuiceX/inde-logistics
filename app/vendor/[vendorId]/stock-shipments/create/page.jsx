'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';  // Import the reusable ProductCard component

export default function CreateStockShipmentPage() {
  const router = useRouter();
  const { vendorId } = useParams();  // Get vendorId from route

  // State variables
  const [products, setProducts] = useState([]);                  // Products to display
  const [selectedItems, setSelectedItems] = useState([]);        // Selected products with quantities
  const [searchTerm, setSearchTerm] = useState('');              // User input for search
  const [query, setQuery] = useState('');                        // Actual search query used for API
  const [brandFilter, setBrandFilter] = useState('');            // Filter by brand
  const [brands, setBrands] = useState([]);                      // Available brands for filtering
  const [selectedQuantity, setSelectedQuantity] = useState({});  // Quantity for each product
  const [loading, setLoading] = useState(true);                  // Loading state
  const [error, setError] = useState(null);                      // Error state
  const [page, setPage] = useState(1);                           // Current page for pagination
  const [totalPages, setTotalPages] = useState(0);               // Total number of pages
  const [totalResults, setTotalResults] = useState(0);           // Total number of results
  const pageSize = 30;                                           // Products per page

  // Fetch vendor products with pagination and search
  useEffect(() => {
    if (vendorId) {
      const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `/api/v1/admin/vendor/products/search?vendorId=${vendorId}&q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
          );
          const data = await response.json();
          console.log(data);

          setProducts(data.products || []);
          // If brands are returned by the API, set them for filtering
          // setBrands(data.brands || []);
          setTotalResults(data.pagination.total || 0);
          setTotalPages(Math.ceil(data.pagination.total / pageSize));
        } catch (error) {
          console.error('Error fetching products:', error);
          setError('Failed to fetch products');
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [vendorId, query, page]);  // Fetch products when vendorId, query, or page changes

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

  // Filter products by brand
  const filteredProducts = products.filter(
    (product) => !brandFilter || product.brand === brandFilter
  );

  // Save the shipment and redirect for final submission
  const handleSaveShipment = () => {
    // Implement save shipment logic here (e.g., API call)
    const shipmentId = 'generated_shipment_id'; // Replace with actual shipment ID
    router.push(`/vendor/stockshipments/${shipmentId}`); // Redirect to shipment page
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        {/* Header and Search */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create Stock Shipment</h1>
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="px-4 py-2 border border-gray-300 rounded-md"
            />
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              onClick={() => {
                setPage(1);            // Reset to first page on new search
                setQuery(searchTerm);  // Set the search query to trigger API call
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Brand Filter */}
        <div className="flex space-x-4 mb-6">
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPage(1); // Reset to first page when filter changes
            }}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Product List or Loading/Error Messages */}
        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found. Try adjusting your search or filters.</p>
        ) : (
          <>
            {/* Product Cards */}
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.vendor_sku} product={product}>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="number"
                      min="1"
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                      placeholder="Qty"
                      value={selectedQuantity[product.vendor_sku] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product, Number(e.target.value))
                      }
                    />
                    <button
                      onClick={() =>
                        handleSelectProduct(
                          product,
                          selectedQuantity[product.vendor_sku] || 1
                        )
                      }
                      className="px-2 py-1 bg-green-500 text-white rounded-md"
                    >
                      Add
                    </button>
                  </div>
                </ProductCard>
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page {page} of {totalPages}, total results: {totalResults}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
                      page === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-400'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage((prevPage) => Math.min(prevPage + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
                      page === totalPages
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-gray-400'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Selected Items in Shipment */}
            {selectedItems.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Items in Shipment</h2>
                <table className="min-w-full bg-white shadow-md rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Product</th>
                      <th className="px-4 py-2 border">Quantity</th>
                      <th className="px-4 py-2 border">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item) => (
                      <tr key={item.vendor_sku}>
                        <td className="px-4 py-2 border">{item.name}</td>
                        <td className="px-4 py-2 border">{item.quantity}</td>
                        <td className="px-4 py-2 border">
                          <button
                            onClick={() => handleRemoveProduct(item.vendor_sku)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Save Shipment Button */}
            <div className="flex justify-end mt-8">
              <button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                onClick={handleSaveShipment}
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}