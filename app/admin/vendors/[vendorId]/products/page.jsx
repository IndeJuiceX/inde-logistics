'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import VendorMenu from '@/components/admin/VendorMenu'; // Adjust the import path as needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

export default function AllProducts() {
  const { vendorId } = useParams();  // Get the vendorId from the route
  const router = useRouter();  // Use Next.js router for navigation

  const [vendorName, setVendorName] = useState('Vendor'); // State for vendor name
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);  // Current page
  const [pageSize] = useState(25);  // Number of products per page
  const [totalProducts, setTotalProducts] = useState(0);  // Total product count
  const [loadingCount, setLoadingCount] = useState(true); // Loading state for count
  const [searchTerm, setSearchTerm] = useState("");  // State for search term

  // Fetch vendor name
  useEffect(() => {
    if (vendorId) {
      const fetchVendor = async () => {
        try {
          const response = await fetch(`/api/v1/admin/vendor/${vendorId}`);
          const data = await response.json();

          if (response.ok) {
            setVendorName(data.company_name || 'Vendor');
          } else {
            console.error('Failed to fetch vendor name');
          }
        } catch (err) {
          console.error('Error fetching vendor name:', err);
        }
      };
      fetchVendor();
    }
  }, [vendorId]);

  // Fetch total product count once when vendorId is available
  useEffect(() => {
    if (vendorId) {
      const fetchTotalProducts = async () => {
        try {
          const response = await fetch(`/api/v1/admin/vendor/products/count?vendorId=${vendorId}`);
          const data = await response.json();
          setTotalProducts(data.count); // Assuming your API returns { count: number }
          setLoadingCount(false);
        } catch (error) {
          console.error('Error fetching total products count:', error);
          setLoadingCount(false);
        }
      };
      fetchTotalProducts();
    }
  }, [vendorId]);

  // Fetch paginated products when page or vendorId changes
  useEffect(() => {
    if (vendorId) {
      const fetchProducts = async () => {
        try {
          const response = await fetch(`/api/v1/admin/vendor/products?vendorId=${vendorId}&page=${page}&pageSize=${pageSize}`);
          const data = await response.json();
          setProducts(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching products:', error);
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [vendorId, page]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/vendor/products/search?vendorId=${vendorId}&q=${searchTerm}`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
      setPage(1); // Reset to first page on search
    } catch (error) {
      console.error('Error searching products:', error);
      setLoading(false);
    }
  };

  const handleDeleteCatalogue = async () => {
    const confirmed = confirm("Are you sure you want to delete the entire catalogue? This action cannot be undone.");
    if (confirmed) {
      try {
        const response = await fetch(`/api/v1/admin/vendor/delete-products?vendorId=${vendorId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Catalogue deleted successfully.");
          setProducts([]);  // Clear products after deletion
          setTotalProducts(0);
        } else {
          alert("Failed to delete the catalogue.");
        }
      } catch (error) {
        console.error('Error deleting catalogue:', error);
        alert("Error deleting the catalogue.");
      }
    }
  };

  const handleEditProduct = (productId) => {
    router.push(`/admin/vendors/${vendorId}/products/${productId}/edit`);
  };

  const handleViewProduct = (productId) => {
    router.push(`/admin/vendors/${vendorId}/products/${productId}`);
  };

  // Helper function to extract productId from sk
  const extractProductId = (sk) => {
    return sk.split('PRODUCT#')[1];
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {/* Vendor Menu */}
        <VendorMenu vendorId={vendorId} vendorName={vendorName} activePage="Products" />

        {/* Main Content */}
        <div className="bg-white shadow-md rounded-lg p-8 mt-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Products</h2>
            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/admin/vendors/${vendorId}/products/upload`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Add New Product
              </button>
              <button
                onClick={handleDeleteCatalogue}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Delete Catalogue
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md mr-4"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Search
            </button>
          </div>

          {/* Total Products Count */}
          {loadingCount ? (
            <p className="text-center text-lg text-gray-600">Loading total product count...</p>
          ) : totalProducts > 0 ? (
            <h2 className="text-xl text-center text-gray-700 mb-4">
              Total Products: {totalProducts}
            </h2>
          ) : (
            <h2 className="text-xl text-center text-gray-700 mb-4">
              No products found.
            </h2>
          )}

          {/* Products List */}
          {loading ? (
            <p className="text-center text-lg text-gray-600">Loading products...</p>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const productId = extractProductId(product.sk);
                  return (
                    <div
                      key={product.sk}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                        {/* Product Image */}
                        {product.image && (
                          <div className="mb-4">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover rounded-md"
                            />
                          </div>
                        )}
                        {/* Product Details */}
                        <p className="text-gray-700 mb-2">
                          <strong>SKU:</strong> {product.vendor_sku}
                        </p>
                        <p className="text-gray-700 mb-2">
                          <strong>Price:</strong> £{product.sale_price}
                        </p>
                        <p className="text-gray-700 mb-4">
                          <strong>Stock:</strong> {product.stock_available}
                        </p>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(productId)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewProduct(productId)}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalProducts > pageSize && (
                <div className="flex justify-center items-center mt-8">
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className={`px-4 py-2 mr-2 rounded-md ${
                      page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Previous Page
                  </button>
                  <span className="text-gray-700 mx-4">Page {page}</span>
                  <button
                    onClick={handleNextPage}
                    disabled={products.length < pageSize}
                    className={`px-4 py-2 ml-2 rounded-md ${
                      products.length < pageSize ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Next Page
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-600 mt-8">
              No products found. Try adjusting your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}