import React, { useState } from "react";

export default function ProductStockTable({ products }) {
    const [expandedRow, setExpandedRow] = useState(null);

    const toggleRow = (id) => {
        setExpandedRow((prev) => (prev === id ? null : id));
    };

    return (
        <>
            {products.length > 0 && (
                <div className="overflow-x-auto">
                    <div className="mb-4">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-4 text-left text-base font-semibold text-gray-700">IMAGE</th>
                                    <th className="p-4 text-left text-base font-semibold text-gray-700">PRODUCT</th>
                                    <th className="p-4 text-center text-base font-semibold text-gray-700">AISLE</th>
                                    <th className="p-4 text-center text-base font-semibold text-gray-700">SHELF</th>
                                    <th className="p-4 text-center text-base font-semibold text-gray-700">QUANTITY</th>
                                    <th className="p-4 text-center text-base font-semibold text-gray-700"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <tr className="hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                                            <td className="py-4 px-4">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.image} alt={item.name} className="w-12 h-12" />
                                            </td>
                                            <td className="p-4 text-left text-base text-gray-700">{item.name}</td>
                                            <td className="p-4 text-center text-base text-gray-700">
                                                {item?.warehouse?.aisle} {item?.warehouse?.aisle_number}
                                            </td>
                                            <td className="p-4 text-center text-base text-gray-700">
                                                {item?.warehouse?.shelf} {item?.warehouse?.shelf_number}
                                            </td>
                                            <td className="p-4 text-center text-base text-gray-700">x{item?.received}</td>
                                            <td className="p-4 text-center">
                                                <button
                                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                                    onClick={() => toggleRow(index)}
                                                >
                                                        {expandedRow === index ? "Hide" : "Show More"}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRow === index && (
                                            <tr>
                                                <td colSpan="6" className="p-4 bg-gray-50 border-b border-gray-200">
                                                    <div className="text-left">
                                                        <h3 className="text-base font-semibold text-gray-700 mb-2">Attributes</h3>
                                                        <ul className="space-y-2">
                                                            {Object.entries(item.attributes).map(([key, value]) => (
                                                                <li key={key} className="text-base text-gray-600">
                                                                    <strong>{key.toUpperCase()}:</strong> {value}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};


