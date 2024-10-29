// Import necessary AWS SDK clients and commands
import {
    AthenaClient,
    StartQueryExecutionCommand,
    GetQueryExecutionCommand,
    GetQueryResultsCommand,
  } from '@aws-sdk/client-athena';
  
  // Initialize the Athena client
  const athena = new AthenaClient({ region: process.env.AWS_REGION });
  
  // Constants for the database and output location
  const outputLocation = 's3://logistics.indejuice.com/athena-temp/'; // Replace with your S3 bucket
  const database = 'logistics_logs'; // Replace with your database name
  
  /**
   * Reusable function to execute Athena queries.
   *
   * @param {Object} params - The parameters for the query.
   * @param {string} params.queryString - The SQL query string.
   * @param {number} [params.limit] - The maximum number of results to return per page.
   * @param {string} [params.nextToken] - The token for paginated results.
   * @param {string} [params.queryExecutionId] - The ID of a previously executed query.
   * @returns {Promise<Object>} - The query results, next token, and query execution ID.
   */
  async function runAthenaQuery({ queryString, limit, nextToken, queryExecutionId }) {
    try {
      // If no existing queryExecutionId, start a new query
      if (!queryExecutionId) {
        const startCommand = new StartQueryExecutionCommand({
          QueryString: queryString,
          QueryExecutionContext: { Database: database },
          ResultConfiguration: { OutputLocation: outputLocation },
        });
  
        const startResponse = await athena.send(startCommand);
        queryExecutionId = startResponse.QueryExecutionId;
  
        // Wait for query to complete
        await waitForQueryCompletion(queryExecutionId);
      }
  
      // Get query results with pagination
      const results = await getQueryResultsPaginated(queryExecutionId, limit, nextToken);
  
      return {
        data: results.data,
        nextToken: results.nextToken,
        queryExecutionId,
      };
    } catch (error) {
      console.error('Error in runAthenaQuery:', error);
      throw error;
    }
  }
  
  /**
   * Helper function to wait for Athena query completion.
   *
   * @param {string} queryExecutionId - The ID of the query execution.
   * @returns {Promise<void>}
   */
  async function waitForQueryCompletion(queryExecutionId) {
    let queryStatus = 'RUNNING';
    while (queryStatus === 'RUNNING' || queryStatus === 'QUEUED') {
      const statusCommand = new GetQueryExecutionCommand({
        QueryExecutionId: queryExecutionId,
      });
      const statusResponse = await athena.send(statusCommand);
      queryStatus = statusResponse.QueryExecution.Status.State;
  
      if (queryStatus === 'FAILED' || queryStatus === 'CANCELLED') {
        throw new Error(
          `Query ${queryStatus}: ${statusResponse.QueryExecution.Status.StateChangeReason}`
        );
      }
  
      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  
  /**
   * Helper function to get paginated query results from Athena.
   *
   * @param {string} queryExecutionId - The ID of the query execution.
   * @param {number} [limit=1000] - The maximum number of results to return per page.
   * @param {string} [nextToken] - The token for paginated results.
   * @returns {Promise<Object>} - The data and next token.
   */
  async function getQueryResultsPaginated(queryExecutionId, limit = 1000, nextToken) {
    const resultCommandParams = {
      QueryExecutionId: queryExecutionId,
      MaxResults: limit,
    };
  
    if (nextToken) {
      resultCommandParams.NextToken = nextToken;
    }
  
    const resultCommand = new GetQueryResultsCommand(resultCommandParams);
    const resultResponse = await athena.send(resultCommand);
  
    // Extract headers from ResultSetMetadata.ColumnInfo
    const columnInfo = resultResponse.ResultSet.ResultSetMetadata.ColumnInfo;
    const headers = columnInfo.map((info) => info.Name);
  
    const rows = resultResponse.ResultSet.Rows;
  
    // Initialize dataRows
    let dataRows;
  
    // If this is the first page (no nextToken), then the first row is the header row
    if (!nextToken) {
      // Skip the header row
      dataRows = rows.slice(1);
    } else {
      // For subsequent pages, all rows are data rows
      dataRows = rows;
    }
  
    // Format data
    const data = dataRows.map((row) => {
      const values = row.Data.map((item) => item.VarCharValue || null);
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
  
    // Return data along with NextToken for pagination
    return {
      data,
      nextToken: resultResponse.NextToken || null,
    };
  }
  
  /**
   * Helper function to escape strings for SQL queries.
   *
   * @param {string} str - The string to escape.
   * @returns {string} - The escaped string.
   */
  function escapeString(str) {
    return str.replace(/'/g, "''");
  }
  
  /**
   * Helper function to run MSCK REPAIR TABLE on the logs table.
   *
   * @returns {Promise<void>}
   */
  async function runAthenaRepairTable() {
    const repairQuery = `MSCK REPAIR TABLE logistics_logs.logs;`;
  
    const repairCommand = new StartQueryExecutionCommand({
      QueryString: repairQuery,
      QueryExecutionContext: { Database: database },
      ResultConfiguration: { OutputLocation: outputLocation },
    });
  
    const repairResponse = await athena.send(repairCommand);
    const repairQueryExecutionId = repairResponse.QueryExecutionId;
  
    // Wait for the repair query to complete
    await waitForQueryCompletion(repairQueryExecutionId);
  }
  
  /**
   * Function to get a vendor log by its ID.
   *
   * @param {string} vendorId - The vendor's ID.
   * @param {string} logType - The type of the log.
   * @param {string} logId - The ID of the log.
   * @returns {Promise<Object|null>} - The log entry or null if not found.
   */
  export async function getVendorLogById(vendorId, logType, logId) {
    // Construct WHERE conditions
    const whereConditions = `
      vendor_id = '${vendorId}'
      AND environment = '${process.env.APP_ENV}'
      AND log_type = '${logType}'
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
      const result = await runAthenaQuery({ queryString });
  
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
  
    // Construct the SQL query
    const queryString = `
      SELECT method, endpoint, status, duration_ms, timestamp
      FROM logs
      WHERE ${whereConditions}
      ORDER BY timestamp DESC
    `;
  
    try {
      // Step 1: Run MSCK REPAIR TABLE
      //await runAthenaRepairTable();
  
      // Step 2: Run the actual log query using the reusable function
      const result = await runAthenaQuery({
        queryString,
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
  