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
export const createShipmentAndUpdateOrder = async ( vendorId, orderId ) => {
  // Current timestamp
  const timestamp = new Date().toISOString();
  const user = await getLoggedInUser()

  // Define the Put operation for VendorOrderShipment
  const putVendorOrderShipment = {
    Put: {
      Item: {
        pk: `VENDORORDERSHIPMENT#${vendorId}` ,
        sk:  `ORDERSHIPMENT#${orderId}` ,
        create_at: timestamp,
        update_at: timestamp,
        entity_type: 'OrderShipment',
        status: 'processing',
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
        pk: `VENDORORDER#${vendorId}`, // Replace with your actual PK format
        sk: `ORDER#${orderId}`, // Replace with your actual SK format
      },
      UpdateExpression: 'SET update_at = :updateAt, #st = :status',
      ExpressionAttributeValues: {
        ':updateAt': timestamp,
        ':status': 'processing' ,
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
