'use client';

import { useEffect } from "react";
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import { useParams } from "next/navigation";
import { queryItemsWithPkAndSk } from "@/services/external/dynamo/wrapper";


export default function GlobalProductLoad() {
    const params = useParams();
    const { globalProducts, setGlobalProducts } = useGlobalContext();

    useEffect(() => {

        const fetchGlobalProducts = async () => {
            // app/api/v1/admin/vendor/products/route.js
            const response = await fetch(`/api/v1/admin/vendor/products?vendor_id=${params.vendor_id}`);
            const result = await response.json();


            if (!result.error) {
                setGlobalProducts(result);
            }
        }

        if (params.vendor_id && !globalProducts.length) {
            console.log('Global Product Loading');
            fetchGlobalProducts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return null;
}