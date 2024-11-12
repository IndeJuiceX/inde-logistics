import Picking from "@/components/warehouse/picking/picking";

export default async function PickingPage({ params }) {
    const order_id = params.order_id;
    console.log('order_id', order_id);
    const generateRandomItems = () => {
        const itemCount = 4//Math.floor(Math.random() * 5) + 1; // Random count between 1 and 5
        const items = Array.from({ length: itemCount }, (_, i) => ({
            image: "https://cdn.indejuice.com/images/06r.jpg", // Using the same image
            name: `Item ${i + 1}`,
            warning: "This item contains hazardous material. Handle with care.",
            quantity: Math.floor(Math.random() * 10) + 1, // Random quantity between 1 and 10
            warehouse: {
                shelf_number: 7,
                aisle: "E",
                aisle_number: 1,
                location_id: "2B64NH",
                shelf: "R"
            }
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

// console.log('sampleOrders', sampleOrders);


return (

        // sampleOrders.map((order, index) => (
        <>
            <Picking order={sampleOrders[order_id]} />
        </>
        // ))
    )
}
