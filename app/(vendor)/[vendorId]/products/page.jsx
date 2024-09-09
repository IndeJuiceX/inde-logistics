// app/vendor/[vendorId]/page.js
'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function VendorProductsPage() {
  //const router = useRouter();
  const { vendorId } = useParams();;  // Get the vendorId from the route

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);  // Current page
  const [pageSize] = useState(5);  // Number of products per page

  useEffect(() => {
    if (vendorId) {
      const fetchProducts = async () => {
        try {
          const response = await fetch(`/api/v1/internal/vendor/products?vendorId=${vendorId}&page=${page}&pageSize=${pageSize}`);
          const data = await response.json();
          console.log(data)
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
        
        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading products...</p>
        ) : (
          <>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <li key={product.SK} className="bg-white shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700">{product.Details.Name}</h3>
                  <p className="text-gray-500 mb-2">SKU: {product.VendorSku}</p>
                  <p className="text-gray-700 mb-2">Price: ${product.Details.SalePrice}</p>
                  <p className="text-gray-700">Stock: {product.Stock}</p>
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
