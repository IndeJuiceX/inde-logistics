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
            const result = await queryItemsWithPkAndSk(`VENDORPRODUCT#${params.vendor_id}`, 'PRODUCT#');
            if (result.success) {
                setGlobalProducts(result.data);
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