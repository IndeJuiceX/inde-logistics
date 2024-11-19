'use server'
import PackingApp from '@/components/warehouse/packing/packingApp';
import { getNextUnPackedOrderShipment } from '@/services/data/order-shipment';


export default async function PackingPage() {

    const getNextUnPackedOrder = await getNextUnPackedOrderShipment();

    console.log('getNextUnPackedOrder', getNextUnPackedOrder);
    

    return (
        <PackingApp />
    )
}