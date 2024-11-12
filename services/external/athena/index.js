
import { AthenaWrapper } from './wrapper.js'; // Adjust the path as necessary


// Extract environment variables
const { AWS_REGION, APP_ENV } = process.env;
const athenOutputLocation = 's3://logistics.indejuice.com/athena-temp/'
// Initialize the AthenaWrapper
const athenaWrapper = new AthenaWrapper({
  region: AWS_REGION,
  environment: APP_ENV,
  outputLocation: athenOutputLocation,
});

/**
 * Example Function to Execute a Data Query
 */
export async function executeDataQuery(query) {
 

  try {
    const { data, nextToken, queryExecutionId } = await athenaWrapper.runQuery({ queryString: query });
    console.log('Data Query Results:', data);

    // Handle pagination if necessary
    if (nextToken) {
      const nextPage = await athenaWrapper.runQuery({
        queryString: query,
        queryExecutionId,
        nextToken,
      });
      console.log('Next Page Data Query Results:', nextPage.data);
    }
  } catch (error) {
    console.error('Error executing data query:', error);
  }
}

/**
 * Example Function to Execute a Logs Query
 */
export async function executeLogsQuery(query) {
//   const query = `
//     SELECT timestamp, level, message
//     FROM logs
//     WHERE level = 'ERROR'
//     ORDER BY timestamp DESC
//     LIMIT 50;
//   `;

  try {
    const { data, nextToken, queryExecutionId } = await athenaWrapper.runQuery({
      queryString: query,
      database: 'logistics_logs', // Specify the logs database
    });
    console.log('Logs Query Results:', data);

    // Handle pagination if necessary
    if (nextToken) {
      const nextPage = await athenaWrapper.runQuery({
        queryString: query,
        queryExecutionId,
        nextToken,
        database: 'logistics_logs',
      });
      console.log('Next Page Logs Query Results:', nextPage.data);
    }
  } catch (error) {
    console.error('Error executing logs query:', error);
  }
}

/**
 * Example Function to Repair the Orders Table
 */
async function repairOrdersTable() {
  try {
    await athenaWrapper.runRepairTable('orders'); // Replace 'orders' with your table name
    console.log('Athena orders table repair completed.');
  } catch (error) {
    console.error('Error repairing orders table:', error);
  }
}

/**
 * Example Function to Repair the Logs Table
 */
async function repairLogsTable() {
  try {
    await athenaWrapper.runRepairTable('logs', 'logistics_logs'); // Specify the logs database
    console.log('Athena logs table repair completed.');
  } catch (error) {
    console.error('Error repairing logs table:', error);
  }
}

// Execute the data query
executeDataQuery();

// Execute the logs query
executeLogsQuery();

// Optionally, repair the tables
// repairOrdersTable();
// repairLogsTable();
