'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VendorMenu from '@/components/admin/VendorMenu'; // Adjust the import path based on your project structure

export default function EditProductPage() {
  const { vendorId, productId } = useParams(); // Get vendorId and productId from the route
  const router = useRouter();


  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({}); // Track updated fields

  // State for new attribute
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');



  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // http://localhost:3002/api/v1/vendor/products?vendor_sku=10000
        const response = await fetch(`/api/v1/vendor/products?vendor_sku=${productId}`);
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

    // Merge existing attributes with updated attributes
    const combinedAttributes = {
      ...product.attributes,
      ...(updatedFields.attributes || {}),
    };

    const updatedProduct = {
      vendor_sku: product.vendor_sku, // Required identifier
      ...updatedFields, // Include updated fields
      attributes: combinedAttributes, // Include all attributes
    };

    const payload = {
      products: [updatedProduct],
    };

    try {
      const response = await fetch(`/api/v1/admin/vendor/update-products?vendorId=${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Submit updated product data
      });

      if (!response.ok) {
        throw new Error('Error updating product');
      }

      alert('Product updated successfully');
      router.push(`/admin/vendors/${vendorId}/products`); // Redirect to products page after saving
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

  // Handle attributes update
  const handleAttributesChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    // if (name === 'nicotine') {
    //   // If nicotine, convert the string to an array of strings
    //   updatedValue = value.split(',').map((item) => item.trim());
    // }

    setUpdatedFields((prevFields) => ({
      ...prevFields,
      attributes: {
        ...(prevFields.attributes || {}),
        [name]: updatedValue,
      },
    }));

    setProduct((prevProduct) => ({
      ...prevProduct,
      attributes: {
        ...prevProduct.attributes,
        [name]: updatedValue,
      },
    }));
  };

  // Handle adding a new attribute
  const handleAddAttribute = () => {
    if (newAttributeKey && newAttributeValue) {
      let updatedValue = newAttributeValue;

      // if (newAttributeKey === 'nicotine') {
      //   // If nicotine, convert the string to an array of strings
      //   updatedValue = newAttributeValue.split(',').map((item) => item.trim());
      // }

      setProduct((prevProduct) => ({
        ...prevProduct,
        attributes: {
          ...prevProduct.attributes,
          [newAttributeKey]: updatedValue,
        },
      }));

      setUpdatedFields((prevFields) => ({
        ...prevFields,
        attributes: {
          ...(prevFields.attributes || {}),
          [newAttributeKey]: updatedValue,
        },
      }));

      // Clear the input fields
      setNewAttributeKey('');
      setNewAttributeValue('');
    }
  };

  if (loading) {
    return <p className="text-center text-lg">Loading product details...</p>;
  }
  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {/* Vendor Menu */}
        <VendorMenu vendorId={vendorId} />

        {/* Main Content */}
        <div className="bg-white shadow-md rounded-lg p-8 mt-4">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Edit Product: {product.name}
          </h1>
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

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                name="stock"
                type="number"
                value={product.stock_available || ''}
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
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                readOnly // Make SKU read-only
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

            {/* Attributes Section */}
            <div className="border-t mt-6 pt-4">
              <h2 className="text-xl font-semibold mb-4">Attributes</h2>

              {/* Existing Attributes */}
              {Object.entries(product.attributes || {}).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key}
                  </label>
                  <input
                    name={key}
                    value={Array.isArray(value) ? value.join(', ') : value}
                    onChange={handleAttributesChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}

              {/* Add New Attribute */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  New Attribute Key
                </label>
                <input
                  name="newAttributeKey"
                  value={newAttributeKey}
                  onChange={(e) => setNewAttributeKey(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter attribute key"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  New Attribute Value
                </label>
                <input
                  name="newAttributeValue"
                  value={newAttributeValue}
                  onChange={(e) => setNewAttributeValue(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter attribute value"
                />
              </div>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
              >
                Add Attribute
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}