'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function ProductDetailsPage() {
  const { vendorId, productId } = useParams();  // Get vendorId and productId from the route
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/v1/admin/vendor/${vendorId}/product/${productId}`);
        const data = await response.json();
        setProduct(data); // Populate product data
        setLoading(false);
      } catch (err) {
        setError('Error fetching product data');
        setLoading(false);
      }
    };

    if (vendorId && productId) {
      fetchProduct();
    }
  }, [vendorId, productId]);

  if (loading) return <p className="text-center text-lg">Loading product details...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{product.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div>
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="object-cover rounded-md"
                />
              ) : (
                <p className="text-gray-500">No image available</p>
              )}
            </div>

            {/* Product Details */}
            <div>
              <div className="mb-4">
                <p className="text-lg text-gray-600"><strong>Vendor SKU:</strong> {product.vendor_sku}</p>
              </div>
              <div className="mb-4">
                <p className="text-lg text-gray-600"><strong>Brand Name:</strong> {product.brand_name}</p>
              </div>
              <div className="mb-4">
                <p className="text-lg text-gray-600"><strong>Price:</strong> £{product.sale_price}</p>
              </div>
              <div className="mb-4">
                <p className="text-lg text-gray-600"><strong>Stock:</strong> {product.stock}</p>
              </div>
              <div className="mb-4">
                <p className="text-lg text-gray-600"><strong>Status:</strong> {product.status}</p>
              </div>
              <div className="mb-4">
                <p className="text-lg text-gray-600"><strong>Cost Price:</strong> £{product.cost_price}</p>
              </div>

              {/* Attributes Section */}
              {product.attributes && (
                <div className="mb-4">
                  <p className="text-lg text-gray-600"><strong>Attributes:</strong></p>
                  <ul className="list-disc list-inside text-gray-600">
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
