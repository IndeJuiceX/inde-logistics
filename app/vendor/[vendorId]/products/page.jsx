'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image'

export default function VendorProductsPage() {
  const { vendorId } = useParams();  // Get the vendorId from the route

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);  // Current page
  const [pageSize] = useState(25);  // Number of products per page
  const [totalProducts, setTotalProducts] = useState(0);  // Total product count
  const [loadingCount, setLoadingCount] = useState(true); // Loading state for count

  // Fetch total product count once when vendorId is available
  useEffect(() => {
    if (vendorId) {
      const fetchTotalProducts = async () => {
        try {
          const response = await fetch(`/api/v1/internal/vendor/products/count?vendorId=${vendorId}`);
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
  }, [vendorId]);  // This effect runs only once when vendorId is available

  // Fetch paginated products when page or vendorId changes
  useEffect(() => {
    if (vendorId) {
      const fetchProducts = async () => {
        try {
          const response = await fetch(`/api/v1/internal/vendor/products?vendorId=${vendorId}&page=${page}&pageSize=${pageSize}`);
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
  }, [vendorId, page]);  // Re-run the effect when vendorId or page changes

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Products for Vendor: {vendorId}
        </h1>

        {/* Total Products Count */}
        {loadingCount ? (
          <p className="text-center text-lg text-gray-600">Loading total product count...</p>
        ) : (
          <h2 className="text-xl text-center text-gray-700 mb-4">
            Total Products: {totalProducts}
          </h2>
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
                      <p className="text-gray-700">Stock: {product.stock}</p>
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
                  {/* Attributes Section */}
                  {product.attributes && Object.keys(product.attributes).length > 0 && (
                    <div className="mt-4">
        
                      <ul className="text-gray-600 text-sm">
                        {Object.entries(product.attributes).map(([key, value]) => (
                          <li key={key}>
                            <span className="font-semibold capitalize text-sm">{key}: </span>
                            <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>



            {/* Pagination controls */}
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
          </>
        )}
      </div>
    </div>
  );
}