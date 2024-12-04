'use client';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';
export default function ShippingOptionsView({ shippingCodes, countries, vendorId }) {
    const shippingOptions = [
        { code: 'RM-24', deliveryTime: 'Next Day' },
        { code: 'RM-48', deliveryTime: '2 - 3 Days' },
        { code: 'RM-INT', deliveryTime: 'International' }
    ];

    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Order Shipping Options' }
    ];

    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 mt-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shipping Codes</h2>
                <p className="text-gray-600 mb-4">
                    We require the &ldquo;shipping_code&rdquo; in your order request to have one of the values indicated below when creating orders in our system.
                </p>
                {shippingCodes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border-collapse">
                            <thead>
                                <tr>
                                    <th className="border py-2 px-4 bg-gray-100 text-left">Delivery Time</th>
                                    <th className="border py-2 px-4 bg-gray-100 text-left">Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shippingCodes.map((code, index) => {
                                    const option = shippingOptions.find(opt => opt.code === code);
                                    return option ? (
                                        <tr key={index} className="text-gray-600">
                                            <td className="border px-4 py-2">{option.deliveryTime}</td>
                                            <td className="border px-4 py-2">{option.code}</td>
                                        </tr>
                                    ) : null;
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600">No shipping codes available.</p>
                )}

                <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Countries</h2>
                <div className="max-h-80 overflow-y-auto border rounded-lg">
                    <table className="min-w-full bg-white border-collapse">
                        <thead>
                            <tr>
                                <th className="border py-2 px-4 bg-gray-100 text-left">Code</th>
                                <th className="border py-2 px-4 bg-gray-100 text-left">Country</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countries.map((country, index) => (
                                <tr key={index} className="text-gray-600">
                                    <td className="border px-4 py-2">{country.code}</td>
                                    <td className="border px-4 py-2">{country.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
