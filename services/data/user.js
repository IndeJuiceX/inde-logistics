import { getItem, queryItems, putItem, deleteItem } from '../external/dynamo/wrapper';
import { getLoggedInUser } from '@/app/actions';
// Function to retrieve a single vendor by ID
export const getUserByEmail = async (email) => {
  return await getItem(`USER#${email}`, `USER#${email}`);
};

// Function to add or update a vendor
export const saveUser = async (userData) => {
  const userItem = {
    entity_type: 'User',
    ...userData,
  };

  return await putItem(userItem);
};

export const getAllVendorUsers = async () => {
  const params = {
    IndexName: 'gs1_vendor_index',
    KeyConditionExpression: 'entity_type = :entityType',
    ExpressionAttributeValues: {
      ':entityType': 'User',
    },
  };
  return await queryItems(params);
}

export const getAllUsers = async () => {
  const params = {
    IndexName: 'user_entity_type_index',
    KeyConditionExpression: 'entity_type = :entityType',
    ExpressionAttributeValues: {
      ':entityType': 'User',
    },
  };
  return await queryItems(params);
}

export const getVendorUsers = async (vendorId) => {
  // Base query parameters
  const params = {
    IndexName: 'gs1_vendor_index',
    KeyConditionExpression: 'entity_type = :entityType',
    ExpressionAttributeValues: {
      ':entityType': 'User',
    },
  };

  // If vendorId is provided, add it to the KeyConditionExpression and ExpressionAttributeValues
  if (vendorId) {
    params.KeyConditionExpression += ' AND vendor_id = :vendorId';
    params.ExpressionAttributeValues[':vendorId'] = vendorId;
  }

  // Query the DynamoDB index
  return await queryItems(params);
};

export const getUserProfile = async (vendorId) => {
  const userData = await getLoggedInUser()
  const vendorData = await getItem(`VENDOR#${vendorId}`, `VENDOR#${vendorId}`);
  const vendor = vendorData?.data || null
  if (!vendor) {
    return { success: false, error: 'Vendor not found' }
  }
  return {success:true , data :{user_email : userData?.email||null, api_key:vendor.api_key, company_name:vendor.company_name, company_number: vendor.company_number}}
}