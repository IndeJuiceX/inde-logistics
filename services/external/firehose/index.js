import { FirehoseClient, PutRecordCommand, PutRecordBatchCommand, Firehose } from '@aws-sdk/client-firehose';

const client = new FirehoseClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

export function sendLogToFirehose(logData) {
    // console.log(logData);
    const params = {
        DeliveryStreamName: 'logistics_stream', // Replace with your Firehose delivery stream name
        Record: {
            Data: new TextEncoder().encode(JSON.stringify(logData) + '\n'), // Convert data to Uint8Array
        },
    };

    try {
        const command = new PutRecordCommand(params);
        client.send(command)
            .then((response) => {
                console.log('Successfully sent log to Firehose:', response);
            })
            .catch((err) => {
                console.error('Error sending log to Firehose:', err);
            });
    } catch (err) {
        console.error('Unexpected error in sendLogToFirehose:', err);
    }
}

