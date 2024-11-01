import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';

export default function ProductCard({ product, children }) { // Removed `actions` from props
  return (
    <li className="bg-white shadow-md rounded-lg p-6 flex flex-col items-start">
      <div className="flex justify-between items-center w-full">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
          <p className="text-gray-500 mb-2">SKU: {product.vendor_sku || product.id}</p>
          <p className="text-gray-700 mb-2">Price: £{product.sale_price || product.price}</p>
          <p className="text-gray-700">Stock: {product.stock_available}</p>
        </div>
        {product.image && (
          <div className="ml-4 w-24 h-24 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              width={96}
              height={96}
              className="object-cover rounded-md"
            />
          </div>
        )}
      </div>

      {/* Children wrapper with flex layout */}
      <div className="mt-4 w-full flex items-center space-x-2">
        {children}
      </div>

      {/* Removed the action buttons section */}
    </li>
  );
}