// Import the necessary Athena SDK commands
import { AthenaClient, StartQueryExecutionCommand, GetQueryResultsCommand } from '@aws-sdk/client-athena';

// Initialize Athena client
const athena = new AthenaClient({ region: 'your-region' });

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Only GET requests allowed' });
    }

    const { userId, endpoint, startDate, endDate } = req.query;

    // Validate input parameters
    if (!userId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required query parameters' });
    }

    // Construct the SQL query
    const queryString = `
      SELECT * 
      FROM api_logs 
      WHERE user_id = '${userId}'
      AND endpoint = '${endpoint}'
      AND timestamp BETWEEN '${startDate}' AND '${endDate}'
      LIMIT 100;
    `;

    try {
        // Start Athena query execution
        const startCommand = new StartQueryExecutionCommand({
            QueryString: queryString,
            QueryExecutionContext: { Database: 'your-database-name' },
            ResultConfiguration: { OutputLocation: 's3://your-athena-output-bucket/' }
        });

        const startResponse = await athena.send(startCommand);
        const queryExecutionId = startResponse.QueryExecutionId;

        // Check for the status of the query execution
        let queryStatus = null;
        let queryResults = null;

        while (queryStatus !== 'SUCCEEDED') {
            const statusCommand = new GetQueryResultsCommand({
                QueryExecutionId: queryExecutionId
            });
            const statusResponse = await athena.send(statusCommand);
            queryStatus = statusResponse.QueryExecution.Status.State;

            if (queryStatus === 'FAILED' || queryStatus === 'CANCELLED') {
                throw new Error('Query failed or was cancelled');
            }

            if (queryStatus === 'SUCCEEDED') {
                // Get query results
                const resultCommand = new GetQueryResultsCommand({
                    QueryExecutionId: queryExecutionId
                });
                const resultResponse = await athena.send(resultCommand);
                queryResults = resultResponse;
            }

            // Add a delay before rechecking the query status
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Return the query results to the client
        return res.status(200).json(queryResults);

    } catch (error) {
        console.error('Error querying Athena:', error);
        return res.status(500).json({ message: `Error querying Athena: ${error.message}` });
    }
}
