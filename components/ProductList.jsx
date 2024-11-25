import { useState, useEffect } from 'react';
import ProductCardSlim from './ProductCardSlim';

export default function ProductList({ products, onSelectionChange }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [quantities, setQuantities] = useState({});

  // Handle individual product selection
  const handleSelectProduct = (product) => {
    const isSelected = selectedItems.some(
      (item) => item.vendor_sku === product.vendor_sku
    );

    let newSelectedItems;
    if (isSelected) {
      // Deselect product
      newSelectedItems = selectedItems.filter(
        (item) => item.vendor_sku !== product.vendor_sku
      );
    } else {
      // Select product
      newSelectedItems = [
        ...selectedItems,
        { ...product, quantity: quantities[product.vendor_sku] || 1 },
      ];
    }
    setSelectedItems(newSelectedItems);
    onSelectionChange(newSelectedItems);
  };

  // Handle quantity change for a product
  const handleQuantityChange = (product, value) => {
    const quantity = Math.max(1, Number(value));
    setQuantities((prev) => ({
      ...prev,
      [product.vendor_sku]: quantity,
    }));

    // Update quantity in selectedItems if product is selected
    if (
      selectedItems.some((item) => item.vendor_sku === product.vendor_sku)
    ) {
      const updatedItems = selectedItems.map((item) =>
        item.vendor_sku === product.vendor_sku
          ? { ...item, quantity }
          : item
      );
      setSelectedItems(updatedItems);
      onSelectionChange(updatedItems);
    }
  };

  // Handle select all functionality
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedItems([]);
      onSelectionChange([]);
    } else {
      // Select all
      const allSelected = products.map((product) => ({
        ...product,
        quantity: quantities[product.vendor_sku] || 1,
      }));
      setSelectedItems(allSelected);
      onSelectionChange(allSelected);
    }
    setSelectAll(!selectAll);
  };

  return (
    <div>
      {/* Select All Checkbox */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
          className="mr-2"
        />
        <label className="text-gray-700 font-semibold">Select All</label>
      </div>

      {/* Product List */}
      <ul className="divide-y divide-gray-200">
        {products.map((product) => {
          const isSelected = selectedItems.some(
            (item) => item.vendor_sku === product.vendor_sku
          );

          const quantity = quantities[product.vendor_sku] || 1;

          return (
            <ProductCardSlim
              key={product.vendor_sku}
              product={product}
              isSelected={isSelected}
              onSelect={handleSelectProduct}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
            />
          );
        })}
      </ul>
    </div>
  );
}