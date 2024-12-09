'use server'
import PackingApp from '@/components/warehouse/packing/PackingApp';
import { getNextUnPackedOrderShipment } from '@/services/data/order-shipment';


export default async function PackingPage() {

    const getNextUnPackedOrder = await getNextUnPackedOrderShipment();
    let unPackedOrder = [];
    if (getNextUnPackedOrder.success) {
        unPackedOrder = getNextUnPackedOrder;
    }

    return (
        <PackingApp orderData={unPackedOrder.data} errorQueue={false} />
    )
}