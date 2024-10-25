import { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } from '@aws-sdk/client-athena';

const athena = new AthenaClient({ region: process.env.AWS_REGION });

export async function getLogs(vendorId) {
    // SQL to repair partitions
    const repairQuery = `MSCK REPAIR TABLE logistics_logs.logs;`;

    // SQL to fetch logs based on conditions
    const queryString = `
      SELECT * 
      FROM logs 
      WHERE vendor_id = '${vendorId}' 
      AND environment = '${process.env.APP_ENV}'
      LIMIT 100;
    `;

    try {
        // Step 1: Run MSCK REPAIR TABLE
        const repairCommand = new StartQueryExecutionCommand({
            QueryString: repairQuery,
            QueryExecutionContext: { Database: 'logistics_logs' },
            ResultConfiguration: { OutputLocation: 's3://logistics.indejuice.com/athena-temp/' }
        });
        const repairResponse = await athena.send(repairCommand);
        const repairQueryExecutionId = repairResponse.QueryExecutionId;

        // Poll until the repair query succeeds
        let repairStatus = 'RUNNING';
        while (repairStatus === 'RUNNING') {
            const statusCommand = new GetQueryExecutionCommand({
                QueryExecutionId: repairQueryExecutionId
            });
            const statusResponse = await athena.send(statusCommand);
            repairStatus = statusResponse.QueryExecution.Status.State;

            if (repairStatus === 'FAILED' || repairStatus === 'CANCELLED') {
                throw new Error(`Repair query ${repairStatus}: ${statusResponse.QueryExecution.Status.StateChangeReason}`);
            }

            // Wait 2 seconds before checking again
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Step 2: Run the actual log query after repair completes
        const startCommand = new StartQueryExecutionCommand({
            QueryString: queryString,
            QueryExecutionContext: { Database: 'logistics_logs' },
            ResultConfiguration: { OutputLocation: 's3://logistics.indejuice.com/athena-temp/' }
        });

        const startResponse = await athena.send(startCommand);
        const queryExecutionId = startResponse.QueryExecutionId;

        // Poll until the query succeeds
        let queryStatus = 'RUNNING';
        while (queryStatus === 'RUNNING') {
            const statusCommand = new GetQueryExecutionCommand({
                QueryExecutionId: queryExecutionId
            });
            const statusResponse = await athena.send(statusCommand);
            queryStatus = statusResponse.QueryExecution.Status.State;

            if (queryStatus === 'FAILED' || queryStatus === 'CANCELLED') {
                throw new Error(`Query ${queryStatus}: ${statusResponse.QueryExecution.Status.StateChangeReason}`);
            }

            // Wait 2 seconds before checking again
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Get the query results
        const resultCommand = new GetQueryResultsCommand({
            QueryExecutionId: queryExecutionId
        });
        const resultResponse = await athena.send(resultCommand);

        // Format results
        const rows = resultResponse.ResultSet.Rows;
        const headers = rows[0].Data.map(item => item.VarCharValue); // Extract headers
        const data = rows.slice(1).map(row => {
            const values = row.Data.map(item => item.VarCharValue);
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {});
        });

        return data; // Return formatted data
    } catch (error) {
        console.error('Error querying Athena:', error);
        throw new Error(`Error querying Athena: ${error.message}`);
    }
}
