import ProductCard from './ProductCard';

export default function ProductList({
  products,
  selectedQuantity,
  handleQuantityChange,
  handleSelectProduct,
}) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.vendor_sku} product={product}>
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="number"
              min="1"
              className="w-20 px-2 py-1 border border-gray-300 rounded-md"
              placeholder="Qty"
              value={selectedQuantity[product.vendor_sku] || 1}
              onChange={(e) => handleQuantityChange(product, Number(e.target.value))}
            />
            <button
              onClick={() =>
                handleSelectProduct(
                  product,
                  selectedQuantity[product.vendor_sku] || 1
                )
              }
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md"
            >
              Add
            </button>
          </div>
        </ProductCard>
      ))}
    </ul>
  );
}
