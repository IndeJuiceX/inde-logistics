//import { runAthenaQuery } from "@/services/external/athena/index-1";
import { executeLogsQuery } from "@/services/external/athena";

export async function getFilteredLogs(vendorId, startTimestamp, endTimestamp) {
  // Construct WHERE conditions
  console.log('vendorId', vendorId);
  console.log('logId', logId);

  const whereConditions = `
    vendor_id = '${vendorId}'
    AND environment = '${process.env.APP_ENV}'
    AND log_type = 'vendor'
    AND timestamp >= timestamp '${startTimestamp}'
    AND timestamp <= timestamp '${endTimestamp}'
  `;

  // Construct the SQL query
  const queryString = `
    SELECT *
    FROM logs
    WHERE ${whereConditions}

  `;

  try {
    // Execute the query using the reusable function
    const result = await executeLogsQuery({query:queryString})//runAthenaQuery({ queryString });
    console.log('result', result);

    // Return the first record or null if not found
    return result.data[0] || null;
  } catch (error) {
    console.error('Error querying Athena in getVendorLogById:', error);
    throw new Error(`Error querying Athena: ${error.message}`);
  }
}





/**
   * Function to get a vendor log by its ID.
   *
   * @param {string} vendorId - The vendor's ID.
   * @param {string} logType - The type of the log.
   * @param {string} logId - The ID of the log.
   * @returns {Promise<Object|null>} - The log entry or null if not found.
   */
export async function getVendorLogById(vendorId, logId) {
  // Construct WHERE conditions
  console.log('vendorId', vendorId);
  console.log('logId', logId);

  const whereConditions = `
      vendor_id = '${vendorId}'
      AND environment = '${process.env.APP_ENV}'
      AND log_type = 'vendor'
      AND log_id = '${logId}'
    `;

  // Construct the SQL query
  const queryString = `
      SELECT *
      FROM logs
      WHERE ${whereConditions}
      LIMIT 1
    `;

  try {
    // Execute the query using the reusable function
    const result = await executeLogsQuery({ query:queryString });
    console.log('result', result);

    // Return the first record or null if not found
    return result.data[0] || null;
  } catch (error) {
    console.error('Error querying Athena in getVendorLogById:', error);
    throw new Error(`Error querying Athena: ${error.message}`);
  }
}

/**
 * Function to get logs based on various filters.
 *
 * @param {Object} params - The parameters for filtering logs.
 * @param {string} params.logType - The type of logs to retrieve.
 * @param {string} params.vendorId - The vendor's ID.
 * @param {number} [params.status] - The status code to filter by.
 * @param {string} [params.endpoint] - The endpoint to filter by.
 * @param {string} [params.method] - The HTTP method to filter by.
 * @param {number} [params.limit] - The maximum number of results per page.
 * @param {string} [params.nextToken] - The token for pagination.
 * @param {string} [params.paramQueryExecutionId] - The ID of a previously executed query.
 * @returns {Promise<Object>} - The logs data, next token, and query execution ID.
 */
export async function getLogs({
  logType,
  vendorId,
  status,
  endpoint,
  method,
  limit,
  nextToken,
  paramQueryExecutionId,
  startTime,
  endTime,
}) {
  // Construct WHERE conditions based on filters
  let whereConditions = `
      vendor_id = '${vendorId}'
      AND environment = '${process.env.APP_ENV}'
      AND log_type = '${logType}'
    `;

  if (status) {
    whereConditions += ` AND status = ${parseInt(status, 10)}`;
  }
  if (endpoint) {
    const safeEndpoint = escapeString(endpoint);
    whereConditions += ` AND endpoint = '${safeEndpoint}'`;
  }

  if (method) {
    const safeMethod = escapeString(method);
    whereConditions += ` AND method = '${safeMethod}'`;
  }

  if (startTime && endTime) {
    const start = new Date(startTime).toISOString().replace('T', ' ').replace('Z', '');
    const end = new Date(endTime).toISOString().replace('T', ' ').replace('Z', '');
    whereConditions += ` AND timestamp >= timestamp '${start}' AND timestamp <= timestamp '${end}'`;
  }


  // Construct the SQL query
  const queryString = `
      SELECT method, endpoint, status, duration_ms, timestamp,log_id
      FROM logs
      WHERE ${whereConditions}
      ORDER BY timestamp DESC
    `;

    console.log('EXECUTING QUERY STRING---')
    console.log(queryString)
  try {
    // Step 1: Run MSCK REPAIR TABLE
    //await runAthenaRepairTable();

    // Step 2: Run the actual log query using the reusable function
    const result = await executeLogsQuery({
      query:queryString,
      limit,
      nextToken,
      queryExecutionId: paramQueryExecutionId,
    });

    // Return the results
    return {
      data: result.data,
      nextToken: result.nextToken,
      queryExecutionId: result.queryExecutionId,
    };
  } catch (error) {
    console.error('Error querying Athena in getLogs:', error);
    throw new Error(`Error querying Athena: ${error.message}`);
  }
}
