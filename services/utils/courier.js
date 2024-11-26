export const getServiceCode = (order, selectedParcelType) => {
    const parcelType = getParcelType(order, selectedParcelType);
    return parcelType.service_code;
}
// we can extend this function to get the parcel type from the service provider
export const getParcelType = (order, selectedParcelType) => {
    console.log('order', order);
    const shippingCodeSplit = order?.shipping_code?.split('-');
    if (!shippingCodeSplit[0]) {
        return ['error', 'Shipping code is not found'];
    }
    const couriers = order.shipment.courier;
    let parcelType = '';
    if (shippingCodeSplit[0] === 'RM') {
        
        if (selectedParcelType === 'letter') {
            parcelType = couriers.find(type => type.package_type === "large letter");
        }
        if (selectedParcelType === 'parcel' || selectedParcelType === 'extra_large_parcel' || selectedParcelType === 'custom') {
            parcelType = couriers.find(type => type.package_type === "parcel");
        }

    }
    return parcelType;
}