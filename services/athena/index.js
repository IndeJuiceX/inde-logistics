import { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } from '@aws-sdk/client-athena';

const athena = new AthenaClient({ region: process.env.AWS_REGION });

export async function getLogs({ logType, vendorId, status, endpoint, method, limit, nextToken, paramQueryExecutionId }) {
    let queryExecutionId = paramQueryExecutionId;
    // SQL to repair partitions
    const repairQuery = `MSCK REPAIR TABLE logistics_logs.logs;`;

    // **Construct WHERE conditions based on filters**
    let whereConditions = `vendor_id = '${vendorId}' AND environment = '${process.env.APP_ENV}' AND log_type  = '${logType}'`;

    if (status) {
        whereConditions += ` AND status = ${parseInt(status)}`;
    }
    if (endpoint) {
        const safeEndpoint = escapeString(endpoint);
        whereConditions += ` AND endpoint = '${safeEndpoint}'`;
    }

    if (method) {
        const safeMethod = escapeString(method);
        whereConditions += ` AND method = '${safeMethod}'`;
    }

    // **Construct the SQL query**
    const queryString = `
      SELECT * 
      FROM logs 
      WHERE ${whereConditions}
      ORDER BY timestamp DESC
    `;

    try {
        // **Step 1: Run MSCK REPAIR TABLE**
        const repairCommand = new StartQueryExecutionCommand({
            QueryString: repairQuery,
            QueryExecutionContext: { Database: 'logistics_logs' },
            ResultConfiguration: { OutputLocation: 's3://logistics.indejuice.com/athena-temp/' }
        });
        const repairResponse = await athena.send(repairCommand);
        const repairQueryExecutionId = repairResponse.QueryExecutionId;

        // Poll until the repair query succeeds
        await waitForQueryCompletion(repairQueryExecutionId);

        // **Step 2: Run the actual log query after repair completes**
        if (queryExecutionId == null) {
            console.log('Running INto if condtions');

            const startCommand = new StartQueryExecutionCommand({
                QueryString: queryString,
                QueryExecutionContext: { Database: 'logistics_logs' },
                ResultConfiguration: { OutputLocation: 's3://logistics.indejuice.com/athena-temp/' }
            });

            const startResponse = await athena.send(startCommand);
            queryExecutionId = startResponse.QueryExecutionId;

            console.log('startResponse', startResponse);


            // Poll until the query succeeds
            await waitForQueryCompletion(queryExecutionId);
        }
        // **Get the query results with pagination**
        const results = await getQueryResultsPaginated(queryExecutionId, limit, nextToken);

        // return results;
        return {
            data: results.data,
            nextToken: results.nextToken,
            queryExecutionId: queryExecutionId
        }



    } catch (error) {
        console.error('Error querying Athena:', error);
        throw new Error(`Error querying Athena: ${error.message}`);
    }
}

// **Helper function to wait for query completion**
async function waitForQueryCompletion(queryExecutionId) {
    let queryStatus = 'RUNNING';
    while (queryStatus === 'RUNNING' || queryStatus === 'QUEUED') {
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
}

// **Helper function to get paginated results**
async function getQueryResultsPaginated(queryExecutionId, limit, nextToken) {
    const resultCommandParams = {
        QueryExecutionId: queryExecutionId,
        MaxResults: limit//1000, // Adjust as needed (max 1000)
    };

    if (nextToken) {
        resultCommandParams.NextToken = nextToken;
    }

    const resultCommand = new GetQueryResultsCommand(resultCommandParams);
    const resultResponse = await athena.send(resultCommand);

    console.log('resultResponse', resultResponse);



    // Format results
    // const rows = resultResponse.ResultSet.Rows;
    // / Extract headers from ResultSetMetadata.ColumnInfo
    const columnInfo = resultResponse.ResultSet.ResultSetMetadata.ColumnInfo;
    const headers = columnInfo.map(info => info.Name);

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
    const data = dataRows.map(row => {
        const values = row.Data.map(item => item.VarCharValue || null);
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

function escapeString(str) {
    return str.replace(/'/g, "''");
}