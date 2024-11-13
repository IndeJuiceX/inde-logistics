import Picking from "@/components/warehouse/picking/Picking";
import { getNextUnPickedOrder } from '@/services/data/order';

export default async function PickingPage({ params }) {
    const order_id = 1;
    console.log('order_id', order_id);
    const sampleBarcode = ['5056348057744', '5060656828026', '5060656827968', '4895258300042']
    const sampleAttributes = [{
        "volume": "10ml",
        "nicotine": [
            "5mg"
        ],
        "vgpg": "50VG/50PG"
    }, {
        "volume": "20ml",
        "nicotine": [
            "6mg"
        ],
        "vgpg": "60VG/60PG",
        "flavor": "Mint",
        "size": "Small",
        "color": "Red",
        "weight": "100g",
        "size": ""
    }]
    const generateRandomItems = () => {
        const itemCount = 4//Math.floor(Math.random() * 5) + 1; // Random count between 1 and 5
        const items = Array.from({ length: itemCount }, (_, i) => ({
            image: "https://cdn.indejuice.com/images/06r.jpg", // Using the same image
            name: `Item ${i + 1}`,
            warning: "This item contains hazardous material. Handle with care.",
            quantity: Math.floor(Math.random() * 10) + 1, // Random quantity between 1 and 10
            brand_name: `Brand Name ${i + 1}`,
            warehouse: {
                shelf_number: 7,
                aisle: "E",
                aisle_number: 1,
                location_id: "2B64NH",
                shelf: "R2"
            },
            barcode: sampleBarcode[i],
            attributes: sampleAttributes[i]

        }));
        return items;
    };

    const sampleOrders = Array.from({ length: 20 }, (_, i) => ({
        orderCode: `X-${1000 + i}`,
        customerName: `Customer ${i + 1}`,
        referralCode: `REF${i + 1000}`,
        deliveryTime: `${24 + (i % 3) * 12}H`,
        orderNumber: `#${Math.random().toString(36).substring(7).toUpperCase()}`,
        items: generateRandomItems(),
        pickerName: `Picker ${i + 1}`,
        container: `${i + 1} Container`,
        barcodeImage: "barcode.png",
        barcodeText: `BAR-${1000 + i}`,
    }));

    const unPickedResult = await getNextUnPickedOrder();

    if (!unPickedResult.success) {
        console.log('Failed to get unpicked order items', unPickedResult.error);
    }

    console.log(unPickedResult);



    return (

        // sampleOrders.map((order, index) => (sampleOrders[order_id]
        <>
            <Picking order_id={order_id} order={sampleOrders[order_id]} />
            {/* <div>Order ID{order_id}</div> */}
        </>
        // ))
    )
}
