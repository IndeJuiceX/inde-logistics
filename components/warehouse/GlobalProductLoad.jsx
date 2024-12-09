'use client';

import { useEffect } from "react";
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import { useParams } from "next/navigation";



export default function GlobalProductLoad({ globalProductsData }) {
    const params = useParams();
    const { globalProducts, setGlobalProducts } = useGlobalContext();

    useEffect(() => {
        if (globalProductsData) {
            console.log('globalProductsData');
            setGlobalProducts(globalProductsData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return null;
}