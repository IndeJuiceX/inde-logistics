'use server ';

import { getVendorShippingCodes } from '@/services/data/courier';
import ShippingOptionsView from '@/components/vendor/shipping-options/ShippingOptionsView';

export default async function ShippingOptionsPage({ params }) {
    const vendorId = params.vendorId;
    let results = [];
    const shippingCodes = await getVendorShippingCodes(vendorId);
    console.log('shipping codes', shippingCodes);
    if (shippingCodes.success) {
        results = shippingCodes.data;
    }
    return <ShippingOptionsView shippingCodes={results.shipping_codes} />;
}
