// services/data/vendor.js
import { getItem, queryItems, putItem, deleteItem, updateItemIfExists } from '../dynamo/wrapper';

// Function to retrieve a single vendor by ID
export const getVendorById = async (vendorId) => {
    return await getItem(`VENDOR#${vendorId}`, `VENDOR#${vendorId}`);
};

// Function to query all vendors (assuming a GSI on `entity_type`)
export const getAllVendors = async () => {
    const params = {
        IndexName: 'gs1_vendor_index',
        KeyConditionExpression: 'entity_type = :entityType',
        ExpressionAttributeValues: {
            ':entityType': 'Vendor',
        },
    };
    return await queryItems(params);
};

// Function to add or update a vendor
export const saveVendor = async (vendorData) => {
    const vendorItem = {
        pk: `VENDOR#${vendorData.vendorId}`,
        sk: `VENDOR#${vendorData.vendorId}`,
        entity_type: 'Vendor',
        ...vendorData,
    };

    return await putItem(vendorItem);
};

// Function to delete a vendor
export const deleteVendor = async (vendorId) => {
    return await deleteItem(`VENDOR#${vendorId}`, `VENDOR#${vendorId}`);
};

export const toggleVendorStatus = async(vendorId, statusNow) => {
    return await updateItemIfExists(`VENDOR#${vendorId}`,`VENDOR#${vendorId}`,{status:statusNow})
}