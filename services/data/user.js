import { getItem, queryItems, putItem, deleteItem } from '../dynamo/wrapper';

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

export const getAllVendorUsers = async() => {
    const params = {
        IndexName: 'gs1_vendor_index',
        KeyConditionExpression: 'entity_type = :entityType',
        ExpressionAttributeValues: {
            ':entityType': 'User',
        },
    };
    return await queryItems(params);
}