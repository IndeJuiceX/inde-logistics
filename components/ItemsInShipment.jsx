import { useState } from 'react';
import Image from 'next/image';

export default function ItemsInShipment({ selectedItems, handleRemoveProduct }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-6 md:mb-0">
      <div className="border rounded-lg shadow-sm bg-white">
        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer bg-gray-100 border-b"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h2 className="text-xl font-semibold">Items in Shipment</h2>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {!isCollapsed && (
          <div className="px-4 py-2">
            {selectedItems.length === 0 ? (
              <p className="text-gray-500">No items in shipment.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div
                    key={item.vendor_sku}
                    className="flex items-center py-2 border-b last:border-none"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="w-12 h-12 object-cover rounded-md mr-2"
                    />
                    {/* Product Info */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveProduct(item.vendor_sku)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Remove Item"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
