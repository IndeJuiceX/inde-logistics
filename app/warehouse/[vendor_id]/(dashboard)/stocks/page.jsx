'use server'

import ProductStockApp from '@/components/warehouse/stocks/ProductStock';
import { getAllVendors } from "@/services/data/vendor";
import { queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';
export default async function StockPage({ params }) {
    const vendor_id = params.vendor_id;
    const allVendors = await getAllVendors();
    let results = [];
    if (vendor_id !== 'all') {
        const products = await queryItemsWithPkAndSk(`VENDORPRODUCT#${vendor_id}`, 'PRODUCT#');
        if (products.success) {
            results = products.data;
        }
    }

    let allVendorsResults = [];
    if (allVendors.success) {
        allVendorsResults = allVendors.data;
    }

    return (

        <ProductStockApp vendor_id={vendor_id} allVendors={allVendorsResults} products={results} />
    )
}