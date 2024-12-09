'use server'

import StockDashboard from "@/components/warehouse/dashboard/StockDashboard";
import { queryItemsWithPkAndSk } from '@/services/external/dynamo/wrapper';

export default async function StockPage({ params }) {
    const vendor_id = params.vendor_id;
  
    // console.log('products', products);
    return (

        <div>
            <h1>Stock Page</h1>
        </div>
    )
}