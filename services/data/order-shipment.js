// executeTransaction.js

import { transactWriteItems } from "../external/dynamo/wrapper";
import { getLoggedInUser } from "@/app/actions";
/**
 * Function to create a new VendorOrderShipment and update an existing Order
 *
 * @param {Object} params - Parameters for the transaction.
 * @param {string} params.vendorId - The ID of the vendor.
 * @param {string} params.orderId - The ID of the order.
 * @returns {Promise<Object>} - The result of the transaction.
 */
export const createShipmentAndUpdateOrder = async ({ vendorId, orderId }) => {
  // Current timestamp
  const timestamp = new Date().toISOString();
  const user = getLoggedInUser()

  // Define the Put operation for VendorOrderShipment
  const putVendorOrderShipment = {
    Put: {
      Item: {
        pk: { S: `VENDORORDERSHIPMENT#${vendorId}` },
        sk: { S: `ORDERSHIPMENT#${orderId}` },
        create_at: { S: timestamp },
        update_at: { S: timestamp },
        entity_type: { S: 'OrderShipment' },
        status: { S: 'processing' },
        picker : user?.email ||'unknown'
        // Add any additional fields as necessary
      },
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    }
  };

  // Define the Update operation for the existing Order
  const updateOrder = {
    Update: {
      Key: {
        pk: { S: `VENDORORDER#${vendorId}` }, // Replace with your actual PK format
        sk: { S: `ORDER#${orderId}` }, // Replace with your actual SK format
      },
      UpdateExpression: 'SET update_at = :updateAt, #st = :status',
      ExpressionAttributeValues: {
        ':updateAt': { S: timestamp },
        ':status': { S: 'processing' },
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
