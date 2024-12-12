'use server';

import { transactWriteItems, getItem, updateItem, queryItems, queryItemsWithPkAndSk, queryAllItems, deleteItem } from "@/services/external/dynamo/wrapper";
import { getLoggedInUser } from "@/app/actions";
import { getOrder, getOrderWithItemDetails } from "@/services/data/order";
import { getCourierDetails } from "@/services/data/courier";
import { cleanResponseData } from "@/services/utils";
import { executeDataQuery } from "@/services/external/athena";
import { getIdFromDynamoKey } from "@/services/utils";

export const getOrderShipment = async (vendorId, orderId) => {
  return await getItem(`VENDORORDERSHIPMENT#${vendorId}`, `ORDERSHIPMENT#${orderId}`);
}


export const updateOrderShipmentError = async (vendorId, orderId, errorReason = '', userEmail, context) => {
  // Fetch the order shipment to ensure it exists
  const upperCaseContext = context?.toUpperCase()
  const orderShipmentResponse = await getOrderShipment(vendorId, orderId);
  const orderShipment = orderShipmentResponse?.data || null;

  if (!orderShipment) {
    return { success: false, error: 'Order Shipment not found' };
  }

  // Infer error value based on errorReason
  const error = errorReason ? 1 : 0;
  const now = new Date().toISOString()
  // Prepare fields for updating
  const updatedFields = {
    error: error,
    error_reason: errorReason ? JSON.stringify(errorReason) : '',  // Set error_reason or empty string
    updated_at: now  // Set updated_at to the current ISO timestamp
  };
  if (error == 1) {
    updatedFields.ready_for = `error#VENDOR#${vendorId}#ORDERSHIPMENT#${orderId}#${now}`
    //remove the order entry from warehousepicking // warehousepacking... 
  } else {
    updatedFields.ready_for = `VENDOR#${vendorId}#ORDERSHIPMENT#${orderId}#${now}`
  }

  // Use the updateItem wrapper function to update the item without expressionAttributeNames
  //return await updateItem(orderShipment.pk, orderShipment.sk, updatedFields);
  // Update the order shipment
  const updateResponse = await updateItem(orderShipment.pk, orderShipment.sk, updatedFields);

  if (!updateResponse.success) {
    return { success: false, error: updateResponse.error || 'Failed to update order shipment' };
  }

  // If error=1, remove the warehouse picking record
  if (error === 1) {
    // Assuming warehouse picking record keys:
    // pk: `WAREHOUSEPICKING#${userEmail}`
    // sk: `VENDOR#${vendorId}#ORDER#${orderId}`
    const warehousePk = `WAREHOUSE${upperCaseContext}#${userEmail}`;
    const warehouseSk = `VENDOR#${vendorId}#ORDER#${orderId}`;

    const deleteResponse = await deleteItem(warehousePk, warehouseSk);
    if (!deleteResponse.success) {
      return { success: false, error: deleteResponse.error || 'Failed to delete warehouse picking record' };
    }
  }
  return { success: true, data: [] }
};




export const getNextUnPackedOrderShipmentNew = async () => {
  const user = await getLoggedInUser();
  if (!user || !user?.email || !user.email.includes('warehouse@indejuice.com')) {
    return { success: false, error: 'Not Authorized' }
  }
  const params = {
    KeyConditionExpression: '#pk = :pkVal',
    ExpressionAttributeNames: { '#pk': 'pk' },
    ExpressionAttributeValues: { ':pkVal': `WAREHOUSEPACKING#${user.email}` },
    Limit: 1 // Only return the first item
  };

  const response = await queryItems(params);
  const existingKeys = response?.data?.[0] || null;
  if (existingKeys && existingKeys?.pk && existingKeys?.sk) {
    const vendorId = existingKeys.vendor_id//getIdFromDynamoKey(existingKeys.pk)//existingKeys.pk.substring(existingKeys.pk.indexOf('#') + 1);
    const orderId = existingKeys.vendor_order_id//getIdFromDynamoKey(existingKeys.sk)//existingKeys.sk.substring(existingKeys.sk.indexOf('#') + 1);

    const orderDetailsData = await getOrderWithItemDetails(vendorId, orderId)
    const orderData = orderDetailsData?.data || null
    if (!orderData) {
      return {
        success: false,
        error: `Order not found for vendor ${vendorId} and order ${orderId}`,
      }
    }
    const orderShipmentData = await getOrderShipment(orderData.vendor_id, orderData.vendor_order_id)
    const orderShipment = orderShipmentData?.data || null

    if (!orderShipment || !orderShipmentData?.success) {
      return { success: false, error: orderShipmentData.error || 'Error in getting Order Shipment Details' }
    }

    const courierDetailsData = await getCourierDetails(orderData.vendor_id, orderShipment.shipping_code)
    const courierData = courierDetailsData?.data || null
    if (!courierData || !courierDetailsData?.success) {
      return { success: false, error: courierDetailsData.error || 'Error in getting Courier Details' }
    }
    orderData.shipment = cleanResponseData(orderShipment)
    orderData.shipment.courier = courierData
    return {
      success: true,
      data: orderData,

    }
  }

  const responseData = await queryOrderShipmentsByReadyForIndex('picked', 'packing#', 1)//await queryItems(params2);

  const nextOrderKeys = responseData?.data[0] || null
  if (!nextOrderKeys) {
    return { success: true, data: [] }
  }

  const nextOrderVendorId = getIdFromDynamoKey(nextOrderKeys.pk)
  const nextOrderId = getIdFromDynamoKey(nextOrderKeys.sk)
  const orderDetailsData = await getOrderWithItemDetails(nextOrderVendorId, nextOrderId)
  const orderData = orderDetailsData?.data || null

  if (!orderData || !orderDetailsData?.success) {
    return { success: false, error: orderDetailsData.error || 'Error in getting Order Details' }
  }

  //const updateResponse = await updateOrderShipment(orderData.vendor_id, orderData.vendor_order_id, { packer: user?.email || 'UNKNOWN' })
  const updateResponse = await createWarehouseRecordAndUpdateOrder(user?.email, orderData.vendor_id, orderData.vendor_order_id, 'packing')
  //updateOrderShipment by adding the packer email to the packer
  if (!updateResponse?.success) {
    return { success: false, error: 'Error while creating order or updating order shipment' }
  }

  const orderShipmentData = await getOrderShipment(orderData.vendor_id, orderData.vendor_order_id)
  const orderShipment = orderShipmentData?.data || null

  if (!orderShipment || !orderShipmentData?.success) {
    return { success: false, error: orderShipmentData.error || 'Error in getting Order Shipment Details' }
  }

  const courierDetailsData = await getCourierDetails(orderData.vendor_id, orderShipment.shipping_code)
  const courierData = courierDetailsData?.data || null
  if (!courierData || !courierDetailsData?.success) {
    return { success: false, error: courierDetailsData.error || 'Error in getting Courier Details' }
  }
  orderData.shipment = cleanResponseData(orderShipment)
  orderData.shipment.courier = courierData

  return {
    success: true,
    data: orderData,

  }

}


export const getNextUnPickedOrderShipmentNew = async () => {

  const user = await getLoggedInUser();

  if (!user || !user?.email || !user.email.includes('warehouse@indejuice.com')) {
    return { success: false, error: 'Not Authorized' };
  }

  // Check if the user has any orders currently opened for picking
  const params = {
    KeyConditionExpression: '#pk = :pkVal',
    ExpressionAttributeNames: { '#pk': 'pk' },
    ExpressionAttributeValues: { ':pkVal': `WAREHOUSEPICKING#${user.email}` },
    Limit: 1 // Only return the first item
  };

  const response = await queryItems(params);
  const existingKeys = response?.data?.[0] || null;

  if (existingKeys && existingKeys?.pk && existingKeys?.sk) {
    const vendorId = existingKeys.vendor_id;
    const orderId = existingKeys.vendor_order_id;

    const orderDetailsData = await getOrderWithItemDetails(vendorId, orderId);

    const orderData = orderDetailsData?.data || null;
    if (!orderData) {
      return {
        success: false,
        error: `Order not found for vendor ${vendorId} and order ${orderId}`,
      };
    }

    orderData.picker = user.email;
    return { success: true, data: orderData };
  }

  // If the user doesn't have a currently processing order, find an accepted one from the GSI


  const responseData = await queryOrderShipmentsByReadyForIndex('accepted', 'picking#', 1)//await queryItems(params2);

  const nextOrderKeys = responseData?.data?.[0] || null;

  if (!nextOrderKeys) {
    return { success: true, data: [] };
  }

  const vendorId = getIdFromDynamoKey(nextOrderKeys.pk)//nextOrderKeys.pk.split('#')[1];   // Assuming pk = VENDORORDER#vendorId
  const orderId = getIdFromDynamoKey(nextOrderKeys.sk)//nextOrderKeys.sk.split('#')[1];    // Assuming sk = ORDER#orderId
  const orderDetailsData = await getOrderWithItemDetails(vendorId, orderId);

  if (!orderDetailsData || !orderDetailsData?.success) {
    return { success: false, error: orderDetailsData.error || 'Error in getting Order Details' };
  }

  const updateResponse = await createWarehouseRecordAndUpdateOrder(user?.email, vendorId, orderId, 'picking');

  if (!updateResponse?.success) {
    console.timeEnd('Total Execution Time');
    return { success: false, error: 'Error while creating order or updating order shipment' };
  }

  const orderData = orderDetailsData.data;
  orderData.picker = user?.email || 'Unknown';

  return { success: true, data: orderData };
};

/*export const updateOrderShipment = async (vendorId, orderId, updatedFields) => {
  // Get the order shipment and ensure that it exists
  const orderShipmentResponse = await getOrderShipment(vendorId, orderId);

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
};*/

export const updateOrderShipment = async (vendorId, orderId, updatedFields) => {
  // Get the order shipment and ensure that it exists
  const orderShipmentResponse = await getOrderShipment(vendorId, orderId);
  const now = new Date().toISOString()

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
    if (updatedFields?.status == 'picked' && orderShipment?.status == 'processing') {
      await deleteItem(`WAREHOUSEPICKING#${orderShipment.picker}`, `VENDOR#${vendorId}#ORDER#${orderId}`);
      updatedFields.ready_for = `packing#VENDOR#${vendorId}#ORDERSHIPMENT#${orderId}#${now}`
      updatedFields.picked_at = now
    }

    //
    if (updatedFields?.status == 'dispatched' && orderShipment?.status == 'picked') {
      await deleteItem(`WAREHOUSEPACKING#${orderShipment.packer}`, `VENDOR#${vendorId}#ORDER#${orderId}`);

      updatedFields.ready_for = `manifest#VENDOR#${vendorId}#ORDERSHIPMENT#${orderId}#${now}`
      updatedFields.packed_at = now
    }
  }

  if (updatedFields?.error == 1 && updatedFields?.error_reason != '') {
    if (orderShipment.status == 'processing') {
      await deleteItem(`WAREHOUSEPICKING#${orderShipment.picker}`, `VENDOR#${vendorId}#ORDER#${orderId}`);
    } else {
      await deleteItem(`WAREHOUSEPACKING#${orderShipment.packer}`, `VENDOR#${vendorId}#ORDER#${orderId}`);

    }
    updatedFields.ready_for = `error#VENDOR#${vendorId}#ORDERSHIPMENT#${orderId}#${now}`

  }


  // Append 'updated_at' to the updatedFields
  updatedFields.updated_at = now;

  // Use the updateItem wrapper function to update the item
  return await updateItem(orderShipment.pk, orderShipment.sk, updatedFields);
};

export const getOrderShipmentsWithErrors = async () => {
  const allErrorKeys = []
  const ordersWithErrors = []
  const processingErrorResponse = await queryOrderShipmentsByReadyForIndex('processing', 'error#');
  const processingErrors = processingErrorResponse?.data || []
  allErrorKeys.push(...processingErrors)
  const pickedErrorResponse = await queryOrderShipmentsByReadyForIndex('picked', 'error#');
  const pickedErrors = pickedErrorResponse?.data || []
  allErrorKeys.push(...pickedErrors)

  // Loop over each key and get the order data
  for (const { pk, sk } of allErrorKeys) {
    // Extract vendorId and orderId from pk and sk
    const vendorId = getIdFromDynamoKey(pk)//existingKeys.pk.substring(existingKeys.pk.indexOf('#') + 1);
    const orderId = getIdFromDynamoKey(sk)//existingKeys.sk.substring(existingKeys.sk.indexOf('#') + 1);

    // Fetch the order details
    const orderDetailsData = await getOrderWithItemDetails(vendorId, orderId);
    const orderData = orderDetailsData?.data || null
    const orderShipmentData = await getOrderShipment(orderData.vendor_id, orderData.vendor_order_id)
    const orderShipment = orderShipmentData?.data || null

    const courierDetailsData = await getCourierDetails(orderData.vendor_id, orderShipment.shipping_code)
    const courierData = courierDetailsData?.data || null
    orderData.shipment = orderShipment
    orderData.shipment.courier = courierData
    if (orderDetailsData.success) {
      // Add the order data to the array
      ordersWithErrors.push(orderData);
    }
  }

  return { success: true, data: ordersWithErrors };
}

export const manifestOrderShipments = async () => {
  // Query the GSI for all order shipments with status 'dispatched' and ready_for_manifest starts with 'true#'

  const response = await queryOrderShipmentsByReadyForIndex('dispatched', 'manifest#');

  if (!response.success) {
    console.error('Error querying order_shipments_ready_for_manifest:', response.error);
    return { success: false, error: response.error };
  }

  const orders = response.data;

  if (orders.length === 0) {
    console.log('No order shipments ready for manifesting.');
    return { success: true, message: 'No orders to manifest.' };
  }

  const now = new Date().toISOString();
  const results = [];

  for (const order of orders) {
    const { pk, sk } = order;

    try {
      // Extract vendorId and orderId from pk and sk
      const vendorId = getIdFromDynamoKey(pk)//pk.split('#')[1]; // Assuming pk format is `VENDORORDERSHIPMENT#vendorId`
      const orderId = getIdFromDynamoKey(sk)//sk.split('#')[1];  // Assuming sk format is `ORDERSHIPMENT#orderId`

      // Update the order shipment using the updateOrderShipment function
      const updatedFields = {
        manifested_at: now, // Set the current timestamp
        ready_for: null, // Explicitly set this to null to trigger removal
      };

      const updateResponse = await updateOrderShipment(vendorId, orderId, updatedFields);
      if (updateResponse.success) {
        console.log(`Order shipment ${pk}#${sk} marked as manifested and ready_for_manifest removed.`);
        results.push({ pk, sk, success: true });
      } else {
        console.error(`Failed to manifest order shipment ${pk}#${sk}:`, updateResponse.error);
        results.push({ pk, sk, success: false, error: updateResponse.error });
      }
    } catch (error) {
      console.error(`Error processing order shipment ${pk}#${sk}:`, error);
      results.push({ pk, sk, success: false, error: error.message });
    }
  }

  return { success: true, message: 'Orders processed.', data: results };
};


/**
 * Creates a warehouse picking record for a given picker, vendor, and order,
 * and updates the order shipment status and removes the ready_for_picking attribute.
 *
 * @param {string} pickerEmail - The email of the picker.
 * @param {string} vendorId - The vendor ID.
 * @param {string} orderId - The order ID.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const createWarehouseRecordAndUpdateOrder = async (pickerEmail, vendorId, orderId, context) => {
  const now = new Date().toISOString();

  const upperCaseContext = context.toUpperCase()
  const transactionItems = [
    // 1. Create the warehouse picking record
    {
      Put: {
        // TableName will be added by transactWriteItems wrapper if needed
        Item: {
          pk: `WAREHOUSE${upperCaseContext}#${pickerEmail}`,
          sk: `VENDOR#${vendorId}#ORDER#${orderId}`,
          vendor_id: vendorId,
          vendor_order_id: orderId,
          packer: pickerEmail,
          created_at: now,
        },
        ConditionExpression: 'attribute_not_exists(pk)',
      }
    }

    // 3. Update the order shipment item: remove ready_for_picking, set status=processing

  ];

  if (context == 'picking') {
    const updateOrderItem = // 2. Update the order item: remove ready_for_picking, set status=processing
    {
      Update: {
        Key: {
          pk: `VENDORORDER#${vendorId}`,
          sk: `ORDER#${orderId}`,
        },
        UpdateExpression: 'SET #status = :processing',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':processing': 'processing'
        }
      }
    }
    transactionItems.push(updateOrderItem)
    const updateOrderShipment = {
      Update: {
        Key: {
          pk: `VENDORORDERSHIPMENT#${vendorId}`,
          sk: `ORDERSHIPMENT#${orderId}`,
        },
        UpdateExpression: 'SET #status = :processing, #picker = :pickerVal, #readyFor = :readyForVal',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#picker': 'picker',
          '#readyFor': 'ready_for'
        },
        ExpressionAttributeValues: {
          ':processing': 'processing',
          ':pickerVal': pickerEmail,
          ':readyForVal': `processing#VENDOR${vendorId}#ORDERSHIPMENT#${orderId}#${now}`
        }
      }
    }
    transactionItems.push(updateOrderShipment)
  } else {
    const updateOrderShipmentPacker = {
      Update: {
        Key: {
          pk: `VENDORORDERSHIPMENT#${vendorId}`,
          sk: `ORDERSHIPMENT#${orderId}`,
        },
        UpdateExpression: 'SET  #packer = :packerVal, #readyFor = :readyForVal',
        ExpressionAttributeNames: {
          '#packer': 'packer',
          '#readyFor': 'ready_for'
        },
        ExpressionAttributeValues: {
          ':packerVal': pickerEmail,
          ':readyForVal': `packing#VENDOR${vendorId}#ORDERSHIPMENT#${orderId}#${now}`
        }
      }
    }
    transactionItems.push(updateOrderShipmentPacker)
  }

  try {
    const result = await transactWriteItems(transactionItems);
    if (!result.success) {
      throw new Error(result.error || 'Unknown transaction error');
    }
    return { success: true };
  } catch (error) {
    console.error('Error creating warehouse picking record and updating order shipment:', error);
    return { success: false, error: error.message };
  }
};


export const markProcessComplete = async (vendorId, orderId, userEmail, newStatus) => {
  // Convert newStatus to lowercase
  newStatus = newStatus.toLowerCase();


  const now = new Date().toISOString();

  let nextContext = '';
  if (newStatus === 'picked') {
    nextContext = 'packing';
  } else if (newStatus === 'packed') {
    nextContext = 'dispatching';
  }

  const readyForVal = `${nextContext}#VENDOR#${vendorId}#ORDERSHIPMENT#${orderId}#${now}`;

  // Build the UpdateExpression for the order shipment:
  // SET status, updated_at, and <newStatus>_at, and ready_for always updated
  const updateExpression = `SET #status = :newStatus, updated_at = :now, #${newStatus}_at = :now, ready_for = :readyForVal`;

  const expressionAttributeNames = {
    '#status': 'status',
    [`#${newStatus}_at`]: `${newStatus}_at`
  };

  const expressionAttributeValues = {
    ':newStatus': newStatus,
    ':now': now,
    ':readyForVal': readyForVal
  };

  // Construct the transaction items
  const transactItems = [
    {
      Update: {
        Key: {
          pk: `VENDORORDERSHIPMENT#${vendorId}`,
          sk: `ORDERSHIPMENT#${orderId}`
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }
    }
  ];

  // If newStatus == 'picked', remove warehouse picking record
  if (newStatus === 'picked') {
    transactItems.push({
      Delete: {
        Key: {
          pk: `WAREHOUSEPICKING#${userEmail}`,
          sk: `VENDOR#${vendorId}#ORDER#${orderId}`
        }
      }
    });
  }

  // If newStatus == 'packed', remove warehouse packing record
  if (newStatus === 'packed') {
    transactItems.push({
      Delete: {
        Key: {
          pk: `WAREHOUSEPACKING#${userEmail}`,
          sk: `VENDOR#${vendorId}#ORDER#${orderId}`
        }
      }
    });
  }

  // Execute the transaction
  const result = await transactWriteItems(transactItems);

  if (!result.success) {
    return { success: false, error: result.error || 'Transaction failed' };
  }

  return { success: true };
};


const queryOrderShipmentsByReadyForIndex = async (currentStatus, readyForBeginsWith, limit = null) => {
  const params = {
    IndexName: 'order_shipment_ready_for', // GSI name
    KeyConditionExpression: '#status = :status AND begins_with(#readyFor, :prefix)',
    ExpressionAttributeValues: {
      ':status': currentStatus,
      ':prefix': readyForBeginsWith,
    },
    ExpressionAttributeNames: {
      '#status': 'status', // Map the reserved keyword 'status'
      '#readyFor': 'ready_for', // Map sort key if it's reserved
    },
    ProjectionExpression: 'pk, sk',
  };
  if (limit) {
    params.Limit = limit
  }
  return await queryAllItems(params);
}