// executeTransaction.js

import { transactWriteItems, getItem, updateItem } from "../external/dynamo/wrapper";
import { getLoggedInUser } from "@/app/actions";
import { getOrder } from "./order";
import { getCourierDetails } from "./courier";
import { cleanResponseData } from "../utils";
/**
 * Function to create a new VendorOrderShipment and update an existing Order
 *
 * @param {Object} params - Parameters for the transaction.
 * @param {string} params.vendorId - The ID of the vendor.
 * @param {string} params.orderId - The ID of the order.
 * @returns {Promise<Object>} - The result of the transaction.
 */
export const createShipmentAndUpdateOrder = async (vendorId, orderId) => {
  // Current timestamp
  const timestamp = new Date().toISOString();
  const user = await getLoggedInUser()
  
  const orderData = await getOrder(vendorId, orderId)
  const order = orderData?.data || null 

  if(!order) {
    return {success:false, error : 'Order not found'}
  }
  // Define the Put operation for VendorOrderShipment
  const putVendorOrderShipment = {
    Put: {
      Item: {
        pk: `VENDORORDERSHIPMENT#${vendorId}`,
        sk: `ORDERSHIPMENT#${orderId}`,
        created_at: timestamp,
        updated_at: timestamp,
        entity_type: 'OrderShipment',
        status: 'processing',
        picker: user?.email || 'unknown',
        shipping_code : order.shipping_code,
        expected_delivery_date : order.expected_delivery_date
        // Add any additional fields as necessary
      },
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    }
  };

  // Define the Update operation for the existing Order
  const updateOrder = {
    Update: {
      Key: {
        pk: `VENDORORDER#${vendorId}`, // Replace with your actual PK format
        sk: `ORDER#${orderId}`, // Replace with your actual SK format
      },
      UpdateExpression: 'SET update_at = :updateAt, #st = :status',
      ExpressionAttributeValues: {
        ':updateAt': timestamp,
        ':status': 'processing',
      },
      ExpressionAttributeNames: {
        '#st': 'status', // Alias for 'status' if it's a reserved keyword
      },
      ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
    }
  };

  // Combine the operations into an array
  const transactionItems = [putVendorOrderShipment, updateOrder];

  // Execute the transaction
  const result = await transactWriteItems(transactionItems);

  if (result.success) {
    console.log('Transaction successful: VendorOrderShipment created and Order updated.');
  } else {
    console.error('Transaction failed:', result.error);
  }

  return result;
};

export const getOrderShipment = async (vendorId, orderId) => {
  return await getItem(`VENDORORDERSHIPMENT#${vendorId}`, `ORDERSHIPMENT#${orderId}`);
}

export const updateOrderShipmentStatus = async (vendorId, orderId, newStatus = 'picked') => {
  // get the ordershipment and ensure that it exists... and has the status of processing before it can be set to picked..
  const orderShipmentResponse = await getOrderShipment(vendorId, orderId)
  console.log('orderShipmentResponse', orderShipmentResponse);
  
  const orderShipment = orderShipmentResponse?.data || null
  if (!orderShipment) {
    return { success: false, error: 'Order Shipment not found' }
  }
  if (newStatus === 'picked' && orderShipment.status != 'processing') {
    return { success: false, error: 'Order Shipment must have processing status to be updated to picked' }
  }
  const updatedFields = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };
  // Use the updateItem wrapper function to update the item
  return await updateItem(orderShipment.pk, orderShipment.sk, updatedFields);

}

export const updateOrderShipmentError = async (vendorId, orderId, errorReason = '') => {
  // Fetch the order shipment to ensure it exists
  const orderShipmentResponse = await getOrderShipment(vendorId, orderId);
  const orderShipment = orderShipmentResponse?.data || null;

  if (!orderShipment) {
    return { success: false, error: 'Order Shipment not found' };
  }

  // Infer error value based on errorReason
  const error = errorReason ? 1 : 0;

  // Prepare fields for updating
  const updatedFields = {
    error: error,
    error_reason: errorReason ? JSON.stringify(errorReason) : '',  // Set error_reason or empty string
    updated_at: new Date().toISOString()  // Set updated_at to the current ISO timestamp
  };

  // Use the updateItem wrapper function to update the item without expressionAttributeNames
  return await updateItem(orderShipment.pk, orderShipment.sk, updatedFields);
};

export const getNextUnPackedOrderShipment = async () => {
  const user = await getLoggedInUser();
  if (!user || !user?.email || !user.email.includes('warehouse@indejuice.com')) {
      return { success: false, error: 'Not Authorized' }
  }
  const query1 = `
  SELECT pk,sk
  FROM order_shipments
  WHERE status = 'picked' AND (error IS NULL OR error != 1) AND packer = '${user.email}'
  ORDER BY created_at ASC
  LIMIT 1;
`;
  const existingData = await executeDataQuery({ query: query1 });
  const existingKeys = existingData?.data[0] || null
  if (existingKeys && existingKeys?.pk && existingKeys?.sk) {
      const vendorId = existingKeys.pk.substring(existingKeys.pk.indexOf('#') + 1);
      const orderId = existingKeys.sk.substring(existingKeys.sk.indexOf('#') + 1);

      const orderDetailsData = await getOrderWithItemDetails(vendorId, orderId)
      const orderData = orderDetailsData?.data || null
      if (!orderData) {
          return {
              success: false,
              error: `Order not found for vendor ${vendorId} and order ${orderId}`,
          }
      }
      orderData.picker = user.email
      return {
          success: true,
          data: orderData,

      }
  }

  // if packer has no opened order for packing i.e no picked order with packer email set..
  //then get the top order from picked orders which has no error queue set
  const query2 = `
  SELECT pk,sk
  FROM order_shipments
  WHERE status = 'picked' AND (error IS NULL OR error != 1)'
  ORDER BY created_at ASC
  LIMIT 1;
`;// get the order with accepted status..
  const data = await executeDataQuery({ query: query2 });
  const nextOrderKeys = data?.data[0] || null
  if (!nextOrderKeys) {
      return { success: true, data: [] }
  }

  const orderDetailsData = await getOrderWithItemDetails(nextOrderKeys.vendor_id, nextOrderKeys.vendor_order_id)
  const orderData = orderDetailsData?.data || null
  
  if (!orderData || !orderDetailsData?.success) {
      return { success: false, error: orderDetailsData.error || 'Error in getting Order Details' }
  }

  const updateResponse = await updateOrderShipment(orderData.vendor_id, orderData.vendor_order_id,{packer:user?.email || 'UNKNOWN'})
  //updateOrderShipment by adding the packer email to the packer
  if (!updateResponse?.success) {
      return { success: false, error: 'Error while creating order or updating order shipment' }
  }

  const orderShipmentData = await getOrderShipment(orderData.vendor_id, orderData.vendor_order_id)
  const orderShipment = orderShipmentData?.data || null

  if(!orderShipment || !orderShipmentData?.success) {
    return { success: false, error: orderShipmentData.error || 'Error in getting Order Shipment Details' }
  }

  const courierDetailsData = await getCourierDetails(orderData.vendor_id,orderShipment.shipping_code)
  const courierData = courierDetailsData?.data || null
  if(!courierData || !courierDetailsData?.success) {
    return { success: false, error: courierDetailsData.error || 'Error in getting Courier Details' }
  }
  orderData.shipment = cleanResponseData(orderShipment)
  order.shipment.courier = courierData

  return {
      success: true,
      data: orderData,

  }

}


export const updateOrderShipment = async (vendorId, orderId, updatedFields) => {
  // Get the order shipment and ensure that it exists
  const orderShipmentResponse = await getOrderShipment(vendorId, orderId);
  console.log('orderShipmentResponse', orderShipmentResponse);
  
  const orderShipment = orderShipmentResponse?.data || null;
  if (!orderShipment) {
    return { success: false, error: 'Order Shipment not found' };
  }
  
  // Perform any necessary validations
  if (updatedFields.status) {
    // Example validation: If updating status to 'picked', ensure current status is 'processing'
    if (updatedFields.status === 'picked' && orderShipment.status !== 'processing') {
      return { success: false, error: 'Order Shipment must have processing status to be updated to picked' };
    }
    // You can add more status transition validations here
  }
  
  // Append 'updated_at' to the updatedFields
  updatedFields.updated_at = new Date().toISOString();
  
  // Use the updateItem wrapper function to update the item
  return await updateItem(orderShipment.pk, orderShipment.sk, updatedFields);
};
