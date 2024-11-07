import React, { useState, useContext } from "react";
import { GlobalStateContext } from "@/contexts/GlobalStateContext";
import SearchableDropdown from "@/components/warehouse/dropdown/SearchableDropdown";



export default function MissingItem({ vendor_id, shipment_id, setIsModalOpen, setShipmentDetails }) {
    // Loading state
    const { globalProducts, setError, setErrorMessage, setLoading, setLoaded } = useContext(GlobalStateContext);

    const [expandedRow, setExpandedRow] = useState(null);
    const [products, setProducts] = useState(globalProducts);
    const [selectedBrand, setSelectedBrand] = useState(null);

    const toggleExpand = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    const handleSelectedBrand = (brand) => {
        const filteredProducts = globalProducts.filter(
            (product) => product.brand_name === brand
        );
        setProducts(filteredProducts);
        setSelectedBrand(brand);
    };

    const handleProductSearch = (e) => {
        const searchQuery = e.target.value.toLowerCase();
        if (!searchQuery) {
            setProducts([]);
            return;
        }
        const filteredProducts = globalProducts.filter((product) => {
            const name = product.name?.toLowerCase() || "";
            const sku = product.sku?.toLowerCase() || "";
            return name.includes(searchQuery) || sku.includes(searchQuery);
        });
        setProducts(filteredProducts);
    };

    const handleAddMissingItem = async (product) => {
        setLoading(true);
        console.log('selected product', shipment_id);
        const payload = {
            stock_shipment_id: shipment_id,
            items: [
                {
                    vendor_sku: product.vendor_sku,
                    stock_in: 0,
                }
            ]
        }
        // http://localhost:3002/api/v1/vendor/stock-shipments/add-item?stock_shipment_id=b71m379s
        const response = await fetch(`/api/v1/vendor/stock-shipments/add-item?vendor_id=${vendor_id}&stock_shipment_id=${shipment_id}`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.error) {
            console.error('Error adding item to shipment');
            setError(true);
            setErrorMessage(data.error);
            return;
        }
        // app/api/v1/vendor/stock-shipments/route.js
        const getUpdateShipmentItems = await fetch(`/api/v1/vendor/stock-shipments?vendor_id=${vendor_id}&stock_shipment_id=${shipment_id}`);
        const updateShipmentItems = await getUpdateShipmentItems.json();
        if (updateShipmentItems.error) {
            console.error('Error fetching updated shipment items');
            setError(true);
            setErrorMessage(updateShipmentItems.error);
            return;
        }
        console.log('updateShipmentItems', updateShipmentItems);
        updateShipmentItems.data.items.sort((a, b) => {
            return a.vendor_sku.localeCompare(b.vendor_sku);
        });
        const shipmentsDetails = updateShipmentItems.data;
        setShipmentDetails({
            ...shipmentsDetails,
            items: shipmentsDetails.items.sort((a, b) =>
                a.vendor_sku.localeCompare(b.vendor_sku)
            ),
        });
        console.log('return response', data);
        setLoading(false);
        setLoaded(true);

        setIsModalOpen(false);
        //
    }

    return (
        <div className="h-[80%]">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Missing Items
            </h2>

            <SearchableDropdown products={products} onSelectedBrand={handleSelectedBrand} />

            {selectedBrand && (
                <div className="mb-4">
                    <label htmlFor="tableSearch" className="block text-gray-700 font-semibold mb-2">
                        Search by Name or SKU
                    </label>
                    <input
                        type="search"
                        id="tableSearch"
                        className="border rounded px-2 py-1 w-full text-black"
                        onChange={handleProductSearch}
                        autoComplete="off"
                    />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg shadow-md">
                    <thead>
                        <tr>
                            <th className="px-6 py-4 text-center text-gray-600 font-semibold border-b">
                                Product Image
                            </th>
                            <th className="px-6 py-4 text-center text-gray-600 font-semibold border-b">
                                SKU
                            </th>
                            <th className="px-6 py-4 text-center text-gray-600 font-semibold border-b">
                                Product Name
                            </th>
                            <th className="px-6 py-4 text-center text-gray-600 font-semibold border-b">
                                Quantity
                            </th>
                            <th className="px-6 py-4 text-center text-gray-600 font-semibold border-b">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedBrand &&
                            products &&
                            products.map((product, index) => (
                                <React.Fragment key={index}>
                                    <tr className="hover:bg-gray-100">
                                        <td className="px-6 py-4 border-b">
                                            {/* eslint-disable-next-line */}
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 border-b text-gray-700">
                                            {product.vendor_sku}
                                        </td>
                                        <td className="px-6 py-4 border-b text-gray-700">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 border-b text-gray-700">
                                            {product.stock_available}
                                        </td>
                                        <td className="px-6 py-4 border-b">
                                            <button
                                                className="text-blue-500 underline mr-4"
                                                onClick={() => toggleExpand(index)}
                                            >
                                                {expandedRow === index ? "Show Less" : "Show More"}
                                            </button>
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                                onClick={() => handleAddMissingItem(product)}
                                            >
                                                Add to Shipment
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === index && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 border-b bg-gray-50">
                                                <div className="mt-2">
                                                    {Object.entries(product.attributes).map(([key, value]) => (
                                                        <p key={key} className="text-gray-600">
                                                            <span className="font-semibold">{key}:</span>{" "}
                                                            {Array.isArray(value) ? value.join(", ") : value}
                                                        </p>
                                                    ))}
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
    );
}
