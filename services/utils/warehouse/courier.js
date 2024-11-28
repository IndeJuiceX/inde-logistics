'use server';


import { getOrderWithItemDetails } from "@/services/data/order";
import { getOrderShipment, updateOrderShipment } from "@/services/data/order-shipment";
import { getCourierDetails } from "@/services/data/courier";
import { cleanResponseData } from "@/services/utils";

export const getServiceCode = (order, selectedParcelType) => {
    const parcelType = getParcelType(order, selectedParcelType);
    return parcelType.service_code;
}
// we can extend this function to get the parcel type from the service provider
export const getParcelType = (order, selectedParcelType) => {

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

export const generateLabel = async (vendorId, orderId,stationId) => {
    // Get vendor order with this id
    const orderDetailsData = await getOrderWithItemDetails(vendorId, orderId);
    const orderData = orderDetailsData?.data || null;
    if (!orderData) {
        return {
            success: false,
            error: `Order not found for vendor ${vendorId} and order ${orderId}`,
        };
    }
    const orderShipmentData = await getOrderShipment(orderData.vendor_id, orderData.vendor_order_id);
    const orderShipment = orderShipmentData?.data || null;

    if (!orderShipment || !orderShipmentData?.success) {
        return { success: false, error: orderShipmentData.error || 'Error in getting Order Shipment Details' };
    }

    const courierDetailsData = await getCourierDetails(orderData.vendor_id, orderShipment.shipping_code);
    const courierData = courierDetailsData?.data || null;
    if (!courierData || !courierDetailsData?.success) {
        return { success: false, error: courierDetailsData.error || 'Error in getting Courier Details' };
    }

    const courierDataRow = courierData.filter((item) => item.service_code === orderShipment.service_code);
    orderData.shipment = cleanResponseData(orderShipment);
    orderData.shipment.courier = courierDataRow[0];

    // Extract isInternational from buyer.country
    const isInternational = orderData.buyer.country_code !== 'GB';
    //return orderData;
    // Shipment data with total weight and dimensions
    const shipment = orderData.shipment;

    // Calculate total weight and unit weight
    const totalPackageWeight = shipment.weight_grams;
    const itemCount = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    const unitWeightInGrams = totalPackageWeight / itemCount;

    // Prepare contents array
    let contents = [];
    let totalOrderValue = 0;

    orderData.items.forEach((item) => {
        const value = parseFloat(item.sale_price) || 2.5;
        totalOrderValue += value * item.quantity;

        let description;

        if (isInternational) {
            const firstWord = item.name.split(' ')[0];
            description = firstWord
                ? `${firstWord} HS: 3307.49 Preparations for perfuming or...`
                : '';
            if (description.length > 46) {
                description = description.substring(0, 46) + '...';
            }
        } else {
            description = `SKU-${item.vendor_sku}-${Math.floor(Math.random() * 100) + 1}`;
        }

        contents.push({
            name: description,
            SKU: `SKU-${item.vendor_sku}-${Math.floor(Math.random() * 100) + 1}`,
            quantity: item.quantity,
            unitValue: parseFloat((value).toFixed(2)),
            unitWeightInGrams: parseFloat(unitWeightInGrams.toFixed(2)),
            customsDescription: description,
            originCountryCode: 'GB',
            customsCode: isInternational ? item.customs_code : '',
            customsDeclarationCategory: isInternational ? 'saleOfGoods' : '',
        });
    });

    // Prepare parcel dimensions
    const dimensions = {
        heightInMms: shipment.height_cm * 10,
        widthInMms: shipment.width_cm * 10,
        depthInMms: shipment.depth_cm * 10,
    };

    // Determine service code and package format
    const parcelSize = shipment.courier && shipment.courier.package_type || 'Parcel';
    const serviceCode = shipment.service_code  // Replace 'SC001' with actual logic if needed
    const packageFormatIdentifier = parcelSize === 'large letter' ? 'Large Letter' : 'Parcel';

    // Recipient information
    const addr = orderData.buyer;
    const recipient = {
        fullName: addr.name,
        companyName: '',
        addressLine1: addr.address_line_1,
        addressLine2: addr.address_line_2 || '',
        addressLine3: addr.address_line_3 || '',
        city: addr.city,
        county: addr.address_line_4 || '',
        postcode: addr.postcode,
        countryCode: addr.country_country_code || 'GB',
        phoneNumber: addr.phone || '',
        emailAddress: addr.email,
    };

    // Prepare data payload
    const data = {
        orderReference: orderData.order_id.toString().substring(0, 20),
        recipient: recipient,
        billingAddressSameAsShipping: true,
        weightInGrams: totalPackageWeight,
        packageFormatIdentifier: packageFormatIdentifier,
        dimensions: dimensions,
        contents: contents,
        orderDate: new Date(orderData.created_at).toISOString().split('T')[0],
        subtotal: totalOrderValue,
        shippingCostCharged: orderData.shipping_cost || 0,
        total: totalOrderValue + (orderData.shipping_cost || 0),
        serviceCode: serviceCode,
        serviceRegisterCode: '01', // Adjust if needed
        includeReturnsLabel: false,
        containsDangerousGoods: false,
        includeLabelInResponse: true,
        includeCN: isInternational,
    };

    // Check if label already exists
    if (shipment?.label_key && shipment.label_key !== '') {
        return {
            success: true,
            tracking_code: shipment.tracking,
            label_key: shipment.label_key,
        };
    } else {
        // return data;
        const url = 'https://indelabels.vercel.app/api/label'; // Replace with your actual API endpoint
        const result = await api_POST(url, data);

        if (result && result.trackingNumber) {
            // save tracking label key against shipment...
            const shipmentUpdateFields = {tracking : result.trackingNumber, label_key : result.orderIdentifier}
            await updateOrderShipment(vendorId, orderData.vendor_order_id,shipmentUpdateFields)
            return {
                success: true,
                tracking_code: result.trackingNumber,
                label_key: result.orderIdentifier,
                label_url: result.labelUrl,
            };
        } else {
            return { success: false, error: 'Error generating label' };
        }
    }


}
export const api_POST = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const data2 = await response.json();

        return data2;//{ success: true, data: response.data }


    } catch (error) {
        // ... error handling
        return { success: false, error: error }
    }

}