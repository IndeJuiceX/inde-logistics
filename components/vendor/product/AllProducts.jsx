'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
import ProductSearch from './ProductSearch';
import ProductBox from './ProductBox';
import ManualPagination from './Pagination/ManualPagination';
import ProductSearchByFields from '@/components/vendor/product/ProductSearchByFields';

export default function AllProducts({ vendorId, totalProductsData }) {
  const router = useRouter(); // Use Next.js router for navigation
  // console.log('totalProductsData:', totalProductsData);
  
  const [products, setProducts] = useState(totalProductsData); // Products to display on the current page
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Current page
  const pageSize = 25; // Number of products per page
  const [totalProducts, setTotalProducts] = useState(totalProductsData.length); // Total product count
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Constants for pagination
  const [maxPageButtons] = useState(5); // Max number of page buttons to show

  const [totalPages, setTotalPages] = useState(Math.ceil(totalProducts / pageSize)); // Total number of pages



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

          {/*  this all product search v1 is working fine just comment it out for now 
          <ProductSearch
            vendorId={vendorId}
            searchTerm={searchTerm}
            setSearchTerm={handleSearch}
            handleDeleteCatalogue={handleDeleteCatalogue}
          /> */}

          <ProductSearchByFields 
            vendorId={vendorId}
            setProducts={setProducts}
            setTotalProducts={setTotalProducts}
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
                // pageSize, totalProducts, setPage, page, totalProductsData, searchTerm, setProducts, setLoading, setTotalProducts
                <ManualPagination
                  pageSize={pageSize}
                  totalProducts={totalProducts}
                  setPage={setPage}
                  page={page}
                  totalProductsData={totalProductsData}
                  searchTerm={searchTerm}
                  setProducts={setProducts}
                  setLoading={setLoading}
                  setTotalProducts={setTotalProducts}
                  handlePageClick={handlePageClick}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}