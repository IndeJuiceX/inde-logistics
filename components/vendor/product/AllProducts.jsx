'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
import ProductSearch from './ProductSearch';
import ProductBox from './ProductBox';

export default function AllProducts({ vendorId }) {
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
      console.log('Search results:', data);

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

  const breadCrumbLinks = [
    { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
    { text: 'Product', url: `/vendor/${vendorId}/products` },
    { text: 'All Products', url: `/vendor/${vendorId}/product/all` }
  ];

  return (
    <>
      <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="container mx-auto px-4">

          {/* Only display the search bar and buttons if there are products */}
          {totalProducts > 0 && (
            <ProductSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} handleDeleteCatalogue={handleDeleteCatalogue} />
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
                  <ProductBox key={product.vendor_sku} vendorId={vendorId} product={product} handleViewProduct={handleViewProduct} />
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
    </>
  );
}
