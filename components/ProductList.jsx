import ProductCard from './ProductCard';

export default function ProductList({
  products,
  selectedItems,
  selectedQuantity,
  handleQuantityChange,
  handleSelectProduct,
}) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        // Determine if the product is already in the selectedItems list
        const isSelected = selectedItems.some(
          (item) => item.vendor_sku === product.vendor_sku
        );

        // Get the quantity from selectedQuantity or default to 1
        const quantity = selectedQuantity[product.vendor_sku] || 1;

        return (
          <ProductCard key={product.vendor_sku} product={product}>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="number"
                min="1"
                className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => handleQuantityChange(product, Number(e.target.value))}
              />
              <button
                onClick={() => handleSelectProduct(product, quantity)}
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