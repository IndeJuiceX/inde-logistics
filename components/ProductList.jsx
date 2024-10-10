import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductList({
  products,
  selectedItems,
  handleSelectProduct,
}) {
  // Local state to manage per-product quantities
  const [localQuantities, setLocalQuantities] = useState({});

  // Initialize local quantities based on selectedItems
  useEffect(() => {
    const initialQuantities = {};
    selectedItems.forEach((item) => {
      initialQuantities[item.vendor_sku] = item.quantity;
    });
    setLocalQuantities((prev) => ({ ...prev, ...initialQuantities }));
  }, [selectedItems]);

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        // Determine if the product is already in selectedItems
        const isSelected = selectedItems.some(
          (item) => item.vendor_sku === product.vendor_sku
        );

        // Get the local quantity or default to 1
        const quantity = localQuantities[product.vendor_sku] || 1;

        const handleQuantityChange = (e) => {
          const value = Math.max(1, Number(e.target.value));
          setLocalQuantities((prev) => ({
            ...prev,
            [product.vendor_sku]: value,
          }));
        };

        const handleButtonClick = () => {
          handleSelectProduct(product, quantity);
        };

        return (
          <ProductCard key={product.vendor_sku} product={product}>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="number"
                min="1"
                className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                placeholder="Qty"
                value={quantity}
                onChange={handleQuantityChange}
              />
              <button
                onClick={handleButtonClick}
                className={`px-3 py-1 rounded-md text-white ${
                  isSelected
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isSelected ? 'Update' : 'Add'}
              </button>
            </div>
          </ProductCard>
        );
      })}
    </ul>
  );
}