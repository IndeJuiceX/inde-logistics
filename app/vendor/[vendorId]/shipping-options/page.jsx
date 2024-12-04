'use server ';

import { getVendorShippingCodes } from '@/services/data/courier';
import ShippingOptionsView from '@/components/vendor/shipping-options/ShippingOptionsView';
import { getAllCountriesWithNames } from '@/services/utils/countries';
export default async function ShippingOptionsPage({ params }) {
    const vendorId = params.vendorId;
    let results = [];
    const shippingCodes = await getVendorShippingCodes(vendorId);
 
    if (shippingCodes.success) {
        results = shippingCodes.data;
    }

    const countries = getAllCountriesWithNames();
 

    return <ShippingOptionsView shippingCodes={results.shipping_codes} countries={countries} courierCodes={countries} vendorId={vendorId} />;
}
