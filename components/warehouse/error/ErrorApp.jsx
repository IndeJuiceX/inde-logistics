'use client'

import PackingApp from "@/components/warehouse/packing/PackingApp";

export default function ErrorApp({ errorsData }) {

    if (!errorsData) {
        return <div>No errors found</div>
    }


    if (errorsData.success && Array.isArray(errorsData?.data) && errorsData.data.length === 0) {
        return <div>No errors found</div>
    }

    // const orderData = errorsData.data[0] || null;
    console.log('error orderData', errorsData)
    return (
        <PackingApp orderData={errorsData.data} errorQueue={true} />
    )
}