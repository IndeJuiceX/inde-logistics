'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const { vendorId, productId } = useParams(); // Get vendorId and productId from the route
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({}); // Track updated fields

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedProduct = {
      vendor_sku: product.vendor_sku,
      ...updatedFields, // Only include the fields that have been updated
    };

    const payload = {
      products: [updatedProduct],
    };

    try {
      const response = await fetch(`/api/v1/vendor/update-products?vendorId=${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Submit updated product data
      });

      if (!response.ok) {
        throw new Error('Error updating product');
      }

      alert('Product updated successfully');
      router.push(`/vendor/${vendorId}/products`); // Redirect to products page after saving
    } catch (err) {
      setError('Error updating product');
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUpdatedFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));

    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  // Handle attributes update (if attributes are objects)
  const handleAttributesChange = (e) => {
    const { name, value } = e.target;

    setUpdatedFields((prevFields) => ({
      ...prevFields,
      attributes: {
        ...prevFields.attributes,
        [name]: value,
      },
    }));

    setProduct((prevProduct) => ({
      ...prevProduct,
      attributes: {
        ...prevProduct.attributes,
        [name]: value,
      },
    }));
  };

  if (loading) return <p>Loading product details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Product: {product.name}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={product.status}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand Name</label>
            <input
              name="brand_name"
              value={product.brand_name || ''}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Attributes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Volume</label>
            <input
              name="volume"
              value={product.attributes?.volume || ''}
              onChange={handleAttributesChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">VG/PG</label>
            <input
              name="vgpg"
              value={product.attributes?.vgpg || ''}
              onChange={handleAttributesChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nicotine</label>
            <input
              name="nicotine"
              value={product.attributes?.nicotine?.join(', ') || ''}
              onChange={handleAttributesChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              name="stock"
              type="number"
              value={product.stock || ''}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Vendor SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor SKU</label>
            <input
              name="vendor_sku"
              value={product.vendor_sku || ''}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={product.name || ''}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sale Price</label>
            <input
              name="sale_price"
              type="number"
              value={product.sale_price || ''}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              name="image"
              value={product.image || ''}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost Price</label>
            <input
              name="cost_price"
              type="number"
              value={product.cost_price || ''}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}