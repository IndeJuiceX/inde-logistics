// executeTransaction.js

import { transactWriteItems, getItem, updateItem } from "../external/dynamo/wrapper";
import { getLoggedInUser } from "@/app/actions";
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
        picker: user?.email || 'unknown'
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

  // Prepare fields for updating
  const updatedFields = {};
  const expressionAttributeNames = {};

  // Infer error value based on errorReason
  const error = errorReason ? 1 : 0;
  updatedFields['error'] = error;
  expressionAttributeNames['#error'] = 'error';

  // Set error_reason to the provided reason or reset it to an empty string if not provided
  updatedFields['error_reason'] = errorReason ? JSON.stringify(errorReason) : '';
  expressionAttributeNames['#error_reason'] = 'error_reason';

  // Always update the updated_at timestamp
  updatedFields['updated_at'] = new Date().toISOString();
  expressionAttributeNames['#updated_at'] = 'updated_at';

  // Use the updateItem wrapper function to update the item
  return await updateItem(
    orderShipment.pk, 
    orderShipment.sk, 
    updatedFields, 
    expressionAttributeNames
  );
};

