// athena/index.js

import { AthenaWrapper } from '.@/services/external/athena/wrapper.js'; // Adjust the path as necessary

// Extract environment variables
const { AWS_REGION, APP_ENV } = process.env;
const athenaOutputLocation = 's3://logistics.indejuice.com/athena-temp/';

// Initialize the AthenaWrapper
const athenaWrapper = new AthenaWrapper({
  region: AWS_REGION,
  environment: APP_ENV,
  outputLocation: athenaOutputLocation,
});

/**
 * Function to Execute a Data Query with Pagination
 *
 * @param {Object} params - Parameters for the query.
 * @param {string} params.query - The SQL query string.
 * @param {number} [params.limit] - The maximum number of results per page.
 * @param {string} [params.nextToken] - The token for paginated results.
 * @param {string} [params.queryExecutionId] - The ID of a previously executed query.
 * @returns {Promise<Object>} - The query results, next token, and query execution ID.
 */
export async function executeDataQuery({ query, limit, nextToken, queryExecutionId }) {
  try {
    const result = await athenaWrapper.runQuery({
      queryString: query,
      limit,
      nextToken,
      queryExecutionId,
      // database: 'logistics_production', // Optional: specify if different
    });
    console.log('Data Query Results:', result.data);
    return result;
  } catch (error) {
    console.error('Error executing data query:', error);
    throw error; // Re-throw the error after logging
  }
}

/**
 * Function to Execute a Logs Query with Pagination
 *
 * @param {Object} params - Parameters for the query.
 * @param {string} params.query - The SQL query string.
 * @param {number} [params.limit] - The maximum number of results per page.
 * @param {string} [params.nextToken] - The token for paginated results.
 * @param {string} [params.queryExecutionId] - The ID of a previously executed query.
 * @returns {Promise<Object>} - The query results, next token, and query execution ID.
 */
export async function executeLogsQuery({ query, limit, nextToken, queryExecutionId }) {
  try {
    const result = await athenaWrapper.runQuery({
      queryString: query,
      database: 'logistics_logs', // Specify the logs database
      limit,
      nextToken,
      queryExecutionId,
    });
    console.log('Logs Query Results:', result.data);
    return result;
  } catch (error) {
    console.error('Error executing logs query:', error);
    throw error; // Re-throw the error after logging
  }
}

/**
 * Function to Repair the Orders Table
 *
 * @returns {Promise<void>}
 */
export async function repairOrdersTable() {
  try {
    await athenaWrapper.runRepairTable('orders'); // Replace 'orders' with your table name
    console.log('Athena orders table repair completed.');
  } catch (error) {
    console.error('Error repairing orders table:', error);
    throw error;
  }
}

/**
 * Function to Repair the Logs Table
 *
 * @returns {Promise<void>}
 */
export async function repairLogsTable() {
  try {
    await athenaWrapper.runRepairTable('logs', 'logistics_logs'); // Specify the logs database
    console.log('Athena logs table repair completed.');
  } catch (error) {
    console.error('Error repairing logs table:', error);
    throw error;
  }
}

// Optionally, you can export all functions as needed
