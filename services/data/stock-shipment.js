import { getProductByVendorSku } from '@/services/data/product';
import { generateShipmentId } from '@/services/utils';
import { transactWriteItems } from '@/services/dynamo/wrapper';
import { searchIndex } from '../open-search/wrapper';
export async function createStockShipment(vendorId, stockShipmentItems) {
    try {
        // Second-tier validation: Check if vendor_sku exists in the database
        const invalidItems = [];
        const validItemsWithProductData = [];

        for (const item of stockShipmentItems) {
            const { vendor_sku } = item;

            // Fetch the existing product by vendor_sku
            const result = await getProductByVendorSku(vendorId, vendor_sku);
            if (!result.success || !result.data || result.data.length === 0) {
                invalidItems.push({
                    item: vendor_sku,
                    error: `Product with SKU ${vendor_sku} not found in the system`,
                });
            } /*else {
                // Add the item along with product data to validItemsWithProductData
                validItemsWithProductData.push({
                    ...item,
                    product: result.data[0],
                });
            }*/
        }

        if (invalidItems.length > 0) {
            return {
                success: false,
                error: 'Some items could not be found, please correct or remove these',
                invalidItems
            };
        }

        // All validations passed, proceed with transaction
        const transactionItems = [];

        const shipmentId = generateShipmentId(vendorId) //uuidv4();
        const createdAt = new Date().toISOString();

        // Prepare the StockShipment entry
        const shipmentItem = {
            Put: {
                Item: {
                    pk: `VENDORSTOCKSHIPMENT#${vendorId}`,
                    sk: `STOCKSHIPMENT#${shipmentId}`,
                    entity_type: 'StockShipment',
                    shipment_id: shipmentId,
                    vendor_id: vendorId,
                    created_at: createdAt,
                    status: 'Submitted',  // Or any initial status you want to set
                    // Add other necessary fields here
                },
            },
        };
        transactionItems.push(shipmentItem);

        // Prepare the StockShipmentItem entries
        for (const item of stockShipmentItems) {
            const itemId = item.vendor_sku//uuidv4();
            //const productId = item.product.sk.split('PRODUCT#')[1];  // Extract product ID from 'sk'

            const shipmentItemEntry = {
                Put: {
                    Item: {
                        pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
                        sk: `STOCKSHIPMENTITEM#${itemId}`,
                        entity_type: 'StockShipmentItem',
                        shipment_id: shipmentId,
                        vendor_sku: itemId,
                        //product_id: productId,
                        stock_in: item.stock_in,
                        created_at: createdAt,
                    },
                },
            };
            transactionItems.push(shipmentItemEntry);
        }

        // Execute the transaction
        const transactionResult = await transactWriteItems(transactionItems);

        if (!transactionResult.success) {
            console.error('Transaction failed:', transactionResult.error);
            return {
                success: false,
                error: 'Failed to create stock shipment',
                details: transactionResult.error.message
            };
        }

        // Return success response
        return {
            success: true,
            shipment_id: shipmentId,
            message: 'Stock shipment created successfully',
        };
    } catch (error) {
        console.error('Unhandled error in createStockShipment:', error);
        return { success: false, error: 'Server error', details: error.message };
    }
}

export async function updateStockShipment(vendorId, stockShipmentId, stockShipmentItems) {
    try {
      
  
      // Step 2: Validate the new items
      const invalidItems = [];
      const validItems = [];
  
      for (const item of stockShipmentItems) {
        const { vendor_sku } = item;
  
        // Fetch the existing product by vendor_sku
        const result = await getProductByVendorSku(vendorId, vendor_sku);
        if (!result.success || !result.data || result.data.length === 0) {
          invalidItems.push({
            item: vendor_sku,
            error: `Product with SKU ${vendor_sku} not found in the system`,
          });
        } else {
          validItems.push(item);
        }
      }
  
      if (invalidItems.length > 0) {
        return {
          success: false,
          error: 'Some items could not be found, please correct or remove these',
          invalidItems,
        };
      }
  
      // Step 3: Prepare DynamoDB transaction items
  
      // Fetch existing shipment items to delete
      const existingItemsResponse = await searchIndex(
        {
          bool: {
            must: [
              { term: { 'entity_type.keyword': 'StockShipmentItem' } },
              { term: { 'vendor_id.keyword': vendorId } },
              { term: { 'shipment_id.keyword': stockShipmentId } },
            ],
          },
        },
        {},
        0,
        1000 // Adjust size as needed
      );
  
      const existingItemsHits = existingItemsResponse.hits.hits || [];
      const existingItemKeys = existingItemsHits.map((hit) => {
        const item = hit._source;
        return {
          pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
          sk: `STOCKSHIPMENTITEM#${item.vendor_sku}`,
        };
      });
  
      const transactionItems = [];
  
      // Add Delete requests for existing items
      for (const key of existingItemKeys) {
        transactionItems.push({
          Delete: {
            Key: key,
          },
        });
      }
  
      // Add Put requests for new items
      const updatedAt = new Date().toISOString();
  
      for (const item of validItems) {
        const itemEntry = {
          Put: {
            Item: {
              pk: `VENDORSTOCKSHIPMENTITEM#${vendorId}`,
              sk: `STOCKSHIPMENTITEM#${item.vendor_sku}`,
              entity_type: 'StockShipmentItem',
              vendor_id: vendorId,
              shipment_id: stockShipmentId,
              vendor_sku: item.vendor_sku,
              quantity: item.quantity,
              updated_at: updatedAt,
            },
          },
        };
        transactionItems.push(itemEntry);
      }
  
      // Optionally update the StockShipment entity's metadata (e.g., updated_at)
      const shipmentUpdate = {
        Put: {
          Item: {
            pk: `VENDORSTOCKSHIPMENT#${vendorId}`,
            sk: `STOCKSHIPMENT#${stockShipmentId}`,
            entity_type: 'StockShipment',
            shipment_id: stockShipmentId,
            vendor_id: vendorId,
            updated_at: updatedAt,
            // Include other fields as needed
          },
        },
      };
      transactionItems.push(shipmentUpdate);
  
      // Step 4: Execute the transaction
      const transactionResult = await transactWriteItems(transactionItems);
  
      if (!transactionResult.success) {
        console.error('Transaction failed:', transactionResult.error);
        return {
          success: false,
          error: 'Failed to update stock shipment',
          details: transactionResult.error.message,
        };
      }
  
      // Return success response
      return {
        success: true,
        shipment_id: stockShipmentId,
        message: 'Stock shipment updated successfully',
      };
    } catch (error) {
      console.error('Unhandled error in updateStockShipment:', error);
      return { success: false, error: 'Server error', details: error.message };
    }
  }

export async function getStockShipmentById(vendorId, stockShipmentId) {
    const must = [
        { term: { 'entity_type.keyword': 'StockShipment' } },           // Match the exact entity_type
        { term: { 'pk.keyword': 'VENDORSTOCKSHIPMENT#' + vendorId } },
        { term: { 'sk.keyword': 'STOCKSHIPMENT#' + stockShipmentId } }
    ];
    const response = await searchIndex({
        bool: {
            must: must
        }
    }, {}, 0, 1);

    const results = response.hits.hits;
    const totalHits = response.hits.total.value;  // Total number of matched records

    // Extract only the _source field
    const sources = results.map(item => item._source);
    return {
        success: true,
        data: sources,
        pagination: {
            page: 1,
            pageSize: 1,
            total: totalHits  // Use total hits for pagination, not results length
        }
    };
}

export async function getAllStockShipments(vendorId, page = 1, pageSize = 20) {
    const from = (page - 1) * pageSize;
    const size = pageSize;
    const must = [
        { term: { 'entity_type.keyword': 'StockShipment' } },           // Match the exact entity_type
        { term: { 'pk.keyword': 'VENDORSTOCKSHIPMENT#' + vendorId } }   // Exact match for the vendor's product ID (pk)
    ];

    // Perform the search without the "query" wrapping
    const response = await searchIndex({
        bool: {
            must: must
        }
    }, {}, from, size);  // Pass pagination parameters

    // Extract the results and total hits
    const results = response.hits.hits;
    const totalHits = response.hits.total.value;  // Total number of matched records

    // Extract only the _source field
    const sources = results.map(item => item._source);

    return {
        success: true,
        data: sources,
        pagination: {
            page,
            pageSize,
            total: totalHits  // Use total hits for pagination, not results length
        }
    };
}

export async function getStockShipmentDetails(vendorId, stockShipmentId) {
   // const from = (page - 1) * pageSize;
   // const size = pageSize;
  
    // Get the stock shipment data
    const stockShipmentData = await getStockShipmentById(vendorId, stockShipmentId);
  
    // Extract the shipment object
    const stockShipmentArray = stockShipmentData.data;
    if (!stockShipmentArray || stockShipmentArray.length === 0) {
      // Handle case where shipment is not found
      return {
        success: false,
        error: 'Stock shipment not found.',
      };
    }
    const stockShipment = stockShipmentArray[0]; // Get the shipment object
    
  
    // Build the query for shipment items
    const shipmentItemsMust = [
      { term: { 'entity_type.keyword': 'StockShipmentItem' } },
      { term: { 'pk.keyword': 'VENDORSTOCKSHIPMENTITEM#'+vendorId } },
      { term: { 'shipment_id.keyword': stockShipmentId } },
    ];
  
    // Fetch shipment items with pagination
    const shipmentItemsResponse = await searchIndex(
      {
        bool: {
          must: shipmentItemsMust,
        },
      },
      {},
      0,
      10000
    );
  
    console.log('SHIPMENT ITEMS RESPOSNE----')
    console.log(shipmentItemsResponse)
    const shipmentItemsHits = shipmentItemsResponse.hits.hits;
  
    // Get total number of shipment items for pagination
    const totalHits = shipmentItemsResponse.hits.total.value;
  
    // If no shipment items found
    if (shipmentItemsHits.length === 0) {
      return {
        success: true,
        data: [],
      };
    }
  
    // Step 2: Extract Vendor SKUs from current page of items
    const vendorSkus = shipmentItemsHits.map((hit) => hit._source.vendor_sku);
    const uniqueVendorSkus = [...new Set(vendorSkus)];
  
    // Step 3: Fetch Product Data
    const productsMust = [
      { term: { 'entity_type.keyword': 'Product' } },
      { term: { 'pk.keyword': 'VENDORPRODUCT#'+vendorId } },
      { terms: { 'vendor_sku.keyword': uniqueVendorSkus } },
    ];
  
    const productsResponse = await searchIndex(
      {
        bool: {
          must: productsMust,
        },
      },
      {},
      0,
      uniqueVendorSkus.length
    );

    // Create a map of vendor_sku to product data
    const productDataMap = {};
    productsResponse.hits.hits.forEach((hit) => {
      const product = hit._source;
      productDataMap[product.vendor_sku] = {
        name: product.name,
        image: product.image,
        brand_name: product.brand_name,
      };
    });

    // Step 4: Merge Shipment Items with Product Data
    const shipmentItems = shipmentItemsHits.map((hit) => {
      const item = hit._source;
      const productInfo = productDataMap[item.vendor_sku] || {};
  
      return {
        vendor_sku: item.vendor_sku,
        quantity: item.stock_in,
        ...productInfo,
      };
    });
  
    // Return the final data in the desired format
    return {
      success: true,
      data: {stock_shipment:stockShipment,stock_shipment_items:shipmentItems}, // Shipment items as data
    };
  }