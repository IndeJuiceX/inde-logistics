// athenaWrapper.js

// Import necessary AWS SDK clients and commands
import {
    AthenaClient,
    StartQueryExecutionCommand,
    GetQueryExecutionCommand,
    GetQueryResultsCommand,
  } from '@aws-sdk/client-athena';
  
  /**
   * AthenaWrapper Class
   * A wrapper to execute Athena queries against specified databases.
   */
  export class AthenaWrapper {
    /**
     * Constructs an instance of AthenaWrapper.
     *
     * @param {Object} config - Configuration object.
     * @param {string} config.region - AWS region.
     * @param {string} config.environment - Application environment (e.g., 'production', 'staging').
     * @param {string} config.outputLocation - S3 bucket for Athena query results.
     */
    constructor({ region, environment, outputLocation }) {
      this.athena = new AthenaClient({ region });
      this.environment = environment;
      this.outputLocation = outputLocation;
      this.defaultDatabase = `logistics_${environment}`; // Dynamic database name based on environment
    }
  
    /**
     * Executes an Athena query.
     *
     * @param {Object} params - Parameters for the query.
     * @param {string} params.queryString - The SQL query string.
     * @param {number} [params.limit=1000] - Max results per page.
     * @param {string} [params.nextToken=null] - Token for pagination.
     * @param {string} [params.queryExecutionId=null] - Existing query execution ID.
     * @param {string} [params.database=null] - Database to run the query against. Defaults to `logistics_${environment}`.
     * @returns {Promise<Object>} - Query results, next token, and execution ID.
     */
    async runQuery({ queryString, limit = 1000, nextToken = null, queryExecutionId = null, database = null }) {
      try {
        console.log('Executing Query:', queryString);
  
        const queryDatabase = database || this.defaultDatabase;
  
        // Start a new query if no execution ID is provided
        if (!queryExecutionId) {
          const startCommand = new StartQueryExecutionCommand({
            QueryString: queryString,
            QueryExecutionContext: { Database: queryDatabase },
            ResultConfiguration: { OutputLocation: this.outputLocation },
          });
  
          const startResponse = await this.athena.send(startCommand);
          queryExecutionId = startResponse.QueryExecutionId;
  
          // Wait for the query to complete
          await this.waitForQueryCompletion(queryExecutionId);
        }
  
        // Retrieve paginated results
        const results = await this.getQueryResultsPaginated(queryExecutionId, limit, nextToken);
  
        return {
          data: results.data,
          nextToken: results.nextToken,
          queryExecutionId,
        };
      } catch (error) {
        console.error('Error in runQuery:', error);
        throw error;
      }
    }
  
    /**
     * Waits for an Athena query to complete.
     *
     * @param {string} queryExecutionId - The ID of the query execution.
     * @returns {Promise<void>}
     */
    async waitForQueryCompletion(queryExecutionId) {
      let queryStatus = 'RUNNING';
      while (queryStatus === 'RUNNING' || queryStatus === 'QUEUED') {
        const statusCommand = new GetQueryExecutionCommand({
          QueryExecutionId: queryExecutionId,
        });
        const statusResponse = await this.athena.send(statusCommand);
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
     * Retrieves paginated Athena query results.
     *
     * @param {string} queryExecutionId - The ID of the query execution.
     * @param {number} limit - Max results per page.
     * @param {string} nextToken - Token for pagination.
     * @returns {Promise<Object>} - Data and next token.
     */
    async getQueryResultsPaginated(queryExecutionId, limit = 1000, nextToken = null) {
      const resultCommandParams = {
        QueryExecutionId: queryExecutionId,
        MaxResults: limit,
      };
  
      if (nextToken) {
        resultCommandParams.NextToken = nextToken;
      }
  
      const resultCommand = new GetQueryResultsCommand(resultCommandParams);
      const resultResponse = await this.athena.send(resultCommand);
  
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
     * Escapes single quotes in strings for SQL queries.
     *
     * @param {string} str - The string to escape.
     * @returns {string} - The escaped string.
     */
    escapeString(str) {
      return str.replace(/'/g, "''");
    }
  
    /**
     * Runs MSCK REPAIR TABLE on the specified table.
     *
     * @param {string} tableName - The name of the table to repair.
     * @param {string} [database=null] - Database to run the repair on. Defaults to `logistics_${environment}`.
     * @returns {Promise<void>}
     */
    async runRepairTable(tableName = 'logs', database = null) {
      const repairDatabase = database || this.defaultDatabase;
      const repairQuery = `MSCK REPAIR TABLE ${repairDatabase}.${tableName};`;
  
      const repairCommand = new StartQueryExecutionCommand({
        QueryString: repairQuery,
        QueryExecutionContext: { Database: repairDatabase },
        ResultConfiguration: { OutputLocation: this.outputLocation },
      });
  
      const repairResponse = await this.athena.send(repairCommand);
      const repairQueryExecutionId = repairResponse.QueryExecutionId;
  
      // Wait for the repair query to complete
      await this.waitForQueryCompletion(repairQueryExecutionId);
      console.log(`Successfully ran MSCK REPAIR TABLE on ${repairDatabase}.${tableName}`);
    }
  }
  