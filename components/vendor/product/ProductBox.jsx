'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductBox({ product, handleViewProduct, vendorId }) {
    return (
        <li key={product.sk} className="bg-white shadow-md rounded-lg p-6 flex flex-col items-start">
            <div className="flex justify-between items-center w-full">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
                    <p className="text-gray-500 mb-2">SKU: {product.vendor_sku}</p>
                    <p className="text-gray-700 mb-2">Price: £{product.sale_price}</p>
                    <p className="text-gray-700">Stock: {product.stock_available}</p>
                </div>
                {product.image && (
                    <div className="ml-4 w-24 h-24 flex-shrink-0 overflow-hidden">
                        <img src={product.image} alt={product.name} className="object-cover w-full h-full rounded-md" />
                    </div>
                )}
            </div>

            {/* Action icons for Edit and View */}
            <div className="flex justify-end mt-4 space-x-2 w-full">
                {/* <button
                    onClick={() => handleEditProduct(product.sk.split('PRODUCT#')[1])}
                    className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
                >
                    <FontAwesomeIcon icon={faPencilAlt} />
                    <span className="sr-only">Edit</span>
                </button> */}
                <Link
                    // /vendor/${vendorId}/product/${productId}/edit
                    // href={`/vendor/${product.sk.split('PRODUCT#')[1]}`}
                    href={`/vendor/${vendorId}/product/${product.vendor_sku}/edit`}
                    className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
                >
                    <FontAwesomeIcon icon={faPencilAlt} />
                    <span className="sr-only">Edit</span>
                </Link>
                <button
                    onClick={() => handleViewProduct(product.vendor_sku)}
                    className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
                >
                    <FontAwesomeIcon icon={faEye} />
                    <span className="sr-only">View</span>
                </button>
            </div>
        </li>
    )
}