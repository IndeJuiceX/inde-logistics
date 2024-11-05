'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
import ProductSearch from './ProductSearch';
import ProductBox from './ProductBox';

export default function AllProducts({ vendorId, totalProductsData }) {
  const router = useRouter(); // Use Next.js router for navigation

  const [products, setProducts] = useState([]); // Products to display on the current page
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Current page
  const pageSize = 25; // Number of products per page
  const [totalProducts, setTotalProducts] = useState(totalProductsData.length); // Total product count
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Constants for pagination
  const [maxPageButtons] = useState(5); // Max number of page buttons to show

  // Update products when page changes or search term changes
  useEffect(() => {
    const fetchProductsForPage = () => {
      setLoading(true);

      // Filter products based on the search term if any
      let filteredProducts = totalProductsData;
      if (searchTerm.trim() !== '') {
        filteredProducts = totalProductsData.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Update total products count after filtering
      setTotalProducts(filteredProducts.length);

      // Calculate the products to display on the current page
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const productsForPage = filteredProducts.slice(startIndex, endIndex);

      setProducts(productsForPage);
      setLoading(false);
    };

    fetchProductsForPage();
  }, [page, totalProductsData, searchTerm]);

  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / pageSize);

  // Calculate the range of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Always show the first page
    pageNumbers.push(1);

    const leftSide = Math.max(page - Math.floor(maxPageButtons / 2), 2);
    const rightSide = Math.min(page + Math.floor(maxPageButtons / 2), totalPages - 1);

    if (leftSide > 2) {
      // Add ellipsis if there are pages hidden on the left side
      pageNumbers.push('...');
    }

    // Add the page numbers in the middle
    for (let i = leftSide; i <= rightSide; i++) {
      pageNumbers.push(i);
    }

    if (rightSide < totalPages - 1) {
      // Add ellipsis if there are pages hidden on the right side
      pageNumbers.push('...');
    }

    // Always show the last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Handle page click
  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
  };

  // Handle search term change
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when search term changes
  };

  const handleDeleteCatalogue = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete the entire catalogue? This action cannot be undone.'
    );
    if (confirmed) {
      try {
        // Assuming you have an endpoint to delete all products
        const response = await fetch(`/api/v1/admin/vendor/delete-products?vendorId=${vendorId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Catalogue deleted successfully.');
          setProducts([]); // Clear products after deletion
          setTotalProducts(0);
        } else {
          alert('Failed to delete the catalogue.');
        }
      } catch (error) {
        console.error('Error deleting catalogue:', error);
        alert('Error deleting the catalogue.');
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
    { text: 'Catalogue', url: `/vendor/${vendorId}/products` },
    { text: 'All Products', url: `/vendor/${vendorId}/product/all` },
  ];

  return (
    <>
      <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          {/* Product Search Component */}

          <ProductSearch
            vendorId={vendorId}
            searchTerm={searchTerm}
            setSearchTerm={handleSearch}
            handleDeleteCatalogue={handleDeleteCatalogue}
          />


          {/* Total Products Count */}
          {totalProducts > 0 ? (
            <h2 className="text-xl text-center text-gray-700 mb-4">Total Products: {totalProducts}</h2>
          ) : (
            <h2 className="text-xl text-center text-gray-700 mb-4">No products found.</h2>
          )}

          {loading ? (
            <p className="text-center text-lg text-gray-600">Loading products...</p>
          ) : (
            <>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductBox
                    key={product.vendor_sku}
                    vendorId={vendorId}
                    product={product}
                    handleViewProduct={handleViewProduct}
                  />
                ))}
              </ul>

              {/* Pagination controls */}
              {totalProducts > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center mt-8">
                  {/* Previous Page Button */}
                  <button
                    onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 mr-2 rounded-md ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                  >
                    Previous
                  </button>

                  {/* Page Number Buttons */}
                  {getPageNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (pageNum !== '...') handlePageClick(pageNum);
                      }}
                      disabled={pageNum === '...'}
                      className={`px-4 py-2 mx-1 rounded-md ${page === pageNum
                          ? 'bg-blue-700 text-white'
                          : pageNum === '...'
                            ? 'bg-transparent cursor-default'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Page Button */}
                  <button
                    onClick={() => setPage((prevPage) => Math.min(prevPage + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 ml-2 rounded-md ${page === totalPages
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                  >
                    Next
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