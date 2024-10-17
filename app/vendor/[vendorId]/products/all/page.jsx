'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

export default function AllProducts() {
  const { vendorId } = useParams();  // Get the vendorId from the route
  const router = useRouter();  // Use Next.js router for navigation

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);  // Current page
  const [pageSize] = useState(25);  // Number of products per page
  const [totalProducts, setTotalProducts] = useState(0);  // Total product count
  const [loadingCount, setLoadingCount] = useState(true); // Loading state for count
  const [searchTerm, setSearchTerm] = useState("");  // State for search term

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

  const handleSearch = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      // Include the `page` and `pageSize` in the API call
      const response = await fetch(`/api/v1/admin/vendor/products/search?vendorId=${vendorId}&q=${searchTerm}&page=${page}&pageSize=${pageSize}`);
      const data = await response.json();

      // Set the products and any pagination data if needed
      setProducts(data.products);  // Assuming data.products is where the product list is stored
      //setTotalPages(Math.ceil(data.total / pageSize));  // Calculate total pages from the response
      setLoading(false);
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
    router.push(`/vendor/${vendorId}/product/${productId}/edit`);
  };

  const handleViewProduct = (productId) => {
    router.push(`/vendor/${vendorId}/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">

        {/* Only display the search bar and buttons if there are products */}
        {totalProducts > 0 && (
          <div className="flex justify-between items-center mb-6">
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
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Search
              </button>
              <button
                onClick={handleDeleteCatalogue}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                Delete Catalogue
              </button>
            </div>
          </div>
        )}

        {/* Total Products Count */}
        {loadingCount ? (
          <p className="text-center text-lg text-gray-600">Loading total product count...</p>
        ) : (
          totalProducts > 0 ? (
            <h2 className="text-xl text-center text-gray-700 mb-4">
              Total Products: {totalProducts}
            </h2>
          ) : (
            <h2 className="text-xl text-center text-gray-700 mb-4">
              No products found.
            </h2>
          )
        )}

        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading products...</p>
        ) : (
          <>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <li key={product.sk} className="bg-white shadow-md rounded-lg p-6 flex flex-col items-start">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
                      <p className="text-gray-500 mb-2">SKU: {product.vendor_sku}</p>
                      <p className="text-gray-700 mb-2">Price: £{product.sale_price}</p>
                      <p className="text-gray-700">Stock: {product.stock_available}</p>
                    </div>
                    {product.image && (
                      <div className="ml-4 w-24 h-24 flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={96}
                          height={96}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action icons for Edit and View */}
                  <div className="flex justify-end mt-4 space-x-2 w-full">
                    <button
                      onClick={() => handleEditProduct(product.sk.split('PRODUCT#')[1])}
                      className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                      <span className="sr-only">Edit</span>
                    </button>
                    <button
                      onClick={() => handleViewProduct(product.sk.split('PRODUCT#')[1])}
                      className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span className="sr-only">View</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination controls */}
            {totalProducts > 0 && (
              <div className="flex justify-center items-center mt-8">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className={`px-4 py-2 mr-2 rounded-md ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  Previous Page
                </button>
                <span className="text-gray-700 mx-4">Page {page}</span>
                <button
                  onClick={handleNextPage}
                  className="px-4 py-2 ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Next Page
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
