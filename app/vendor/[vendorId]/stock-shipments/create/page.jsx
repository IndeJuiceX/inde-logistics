'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';  // Import the reusable ProductCard component

export default function CreateStockShipmentPage() {
  const [products, setProducts] = useState([]);  // For displaying vendor products
  const [selectedItems, setSelectedItems] = useState([]);  // Track selected products with quantities
  const [searchTerm, setSearchTerm] = useState('');  // Search for products
  const [brandFilter, setBrandFilter] = useState('');  // Filter by brand
  const [brands, setBrands] = useState([]);  // Vendor brands for filtering
  const [isConfirming, setIsConfirming] = useState(false); // Track confirmation step
  const [selectedQuantity, setSelectedQuantity] = useState({});  // Track quantity for each product

  // Dummy products and brands
  useEffect(() => {
    // For now, we will use dummy data
    const dummyProducts = [
      { id: '1', name: 'Product A', brand: 'Brand X', stock: 50 },
      { id: '2', name: 'Product B', brand: 'Brand X', stock: 30 },
      { id: '3', name: 'Product C', brand: 'Brand Y', stock: 70 },
      { id: '4', name: 'Product D', brand: 'Brand Z', stock: 20 }
    ];
    const dummyBrands = ['Brand X', 'Brand Y', 'Brand Z'];

    setProducts(dummyProducts);
    setBrands(dummyBrands);
  }, []);

  // Handle product selection
  const handleSelectProduct = (product, quantity) => {
    setSelectedItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        // If product already selected, update the quantity
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity } : item
        );
      }
      // Add new product to the shipment
      return [...prev, { ...product, quantity }];
    });
  };

  // Handle product removal
  const handleRemoveProduct = (id) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Handle search/filtering
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!brandFilter || product.brand === brandFilter)
  );

  const handleSubmit = () => {
    setIsConfirming(true);
  };

  // Handle quantity input change for each product
  const handleQuantityChange = (product, quantity) => {
    setSelectedQuantity((prev) => ({
      ...prev,
      [product.id]: quantity,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create Stock Shipment</h1>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="px-4 py-2 border border-gray-300 rounded-md"
          />
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
            Search
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          {/* Brand filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Product List */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              actions={[
                {
                  text: 'Add',
                  onClick: () => handleSelectProduct(product, selectedQuantity[product.id] || 1),
                },
              ]}
            >
              <input
                type="number"
                placeholder="Enter quantity"
                className="px-4 py-2 border border-gray-300 rounded-md mt-4"
                value={selectedQuantity[product.id] || ''}
                onChange={(e) => handleQuantityChange(product, e.target.value)}
              />
            </ProductCard>
          ))}
        </ul>

        {/* Items in Shipment */}
        {selectedItems.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Items in Shipment</h2>
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Product</th>
                  <th className="px-4 py-2 border">Quantity</th>
                  <th className="px-4 py-2 border">Remove</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">{item.quantity}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleRemoveProduct(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end space-x-4 mt-6">
              <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md">
                Save for Later
              </button>
              <button
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                onClick={handleSubmit}
              >
                Confirm and Submit
              </button>
            </div>
          </div>
        )}

        {/* Confirmation modal */}
        {isConfirming && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                Confirm Submission
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to submit this shipment?
              </p>
              <div className="flex space-x-4 justify-end">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                  onClick={() => setIsConfirming(false)}
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded-md">
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
