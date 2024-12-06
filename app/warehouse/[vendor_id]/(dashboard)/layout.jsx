'use server';

import StockDashboard from '@/components/warehouse/dashboard/StockDashboard';
import React from 'react';
import { queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';

export default async function Layout({ children, params }) {
    console.log('params', params);
    const vendor_id = params.vendor_id;
    console.log('vendor_id', vendor_id);
    const allProducts = await queryItemsWithPkAndSk(`VENDORPRODUCT#${vendor_id}`, 'PRODUCT#')

    let results = [];
    if (allProducts.success) {
        results = allProducts.data;
    }


    return (
        <StockDashboard globalProductsData={results}>{children}</StockDashboard>
    );
}