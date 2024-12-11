import ErrorApp from "@/components/warehouse/error/ErrorApp";

import { getOrderShipmentsWithErrors } from "@/services/data/order-shipment";

export default async function ErrorPage() {
    const errorsData = await getOrderShipmentsWithErrors();
  
    return (
        <ErrorApp errorsData={errorsData} />
    );
}