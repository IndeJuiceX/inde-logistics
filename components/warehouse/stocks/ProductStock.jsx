'use client'
import { useState, useEffect } from "react";
import VendorsDropdown from "@/components/warehouse/VendorsDropdown";
import BrandFilter from "@/components/warehouse/stocks/BrandFilter";
import { useGlobalContext } from "@/contexts/GlobalStateContext";
import ProductStockTable from "@/components/warehouse/stocks/ProductStockTable";

export default function ProductStockApp({ vendor_id, allVendors, products }) {
    const { globalProducts } = useGlobalContext();
    const [selectedBrand, setSelectedBrand] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (selectedBrand) {
          
            const url = new URL(window.location.href);
            url.searchParams.set('brand_name', selectedBrand);
            window.history.pushState({ path: url.toString() }, '', url.toString());

            setFilteredProducts(globalProducts.filter(product => product.brand_name === selectedBrand));
        }
        else {
            const url = new URL(window.location.href);
            url.search = '';
            window.history.pushState({ path: url.toString() }, '', url.toString());
            setFilteredProducts([]);
        }
    }, [selectedBrand, globalProducts]);

    useEffect(() => {
        // Check URL for brand_name on component mount
        const url = new URL(window.location.href);
        const brandFromUrl = url.searchParams.get('brand_name');
        if (brandFromUrl && brandFromUrl !== null) {
            setSelectedBrand(brandFromUrl);
            setFilteredProducts(globalProducts.filter(product => product.brand_name === brandFromUrl));
        }
        else {
            setSelectedBrand(null);
            setFilteredProducts([]);
        }
    }, [globalProducts]);

    return (
        <div>
            <VendorsDropdown vendor_id={vendor_id} vendors={allVendors} />
            <BrandFilter setSelectedBrand={setSelectedBrand} selectedBrand={selectedBrand} />
            <ProductStockTable products={filteredProducts} />
        </div>
    )
}