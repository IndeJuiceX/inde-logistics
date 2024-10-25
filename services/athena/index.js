import { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } from '@aws-sdk/client-athena';

const athena = new AthenaClient({ region: process.env.AWS_REGION });

export async function getLogs(vendorId) {
    const queryString = `
      SELECT * 
      FROM logs 
      WHERE vendor_id = '${vendorId}'
      AND environment = '${process.env.APP_ENV}'
      LIMIT 100;
    `;

    try {
        // Start Athena query execution
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

        // Get the query results if succeeded
        const resultCommand = new GetQueryResultsCommand({
            QueryExecutionId: queryExecutionId
        });
        const resultResponse = await athena.send(resultCommand);

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
