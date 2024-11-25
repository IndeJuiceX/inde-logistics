import React from 'react';

export default function ProductCardSlim({
    product,
    isSelected,
    onSelect,
    quantity,
    onQuantityChange,
}) {
    return (
        <li className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            {/* Selection Checkbox */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(product)}
                    className="mr-4"
                />

                {/* Product Image */}
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md mr-4" />
                )}

                {/* Product Details */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
                    <p className="text-gray-500">SKU: {product.vendor_sku || product.id}</p>
                    <p className="text-gray-700">Stock: {product.stock_available}</p>
                </div>
            </div>

            {/* Quantity Input */}
            <div className="flex items-center">
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => onQuantityChange(product, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md mr-4"
                />
            </div>
        </li>
    );
}