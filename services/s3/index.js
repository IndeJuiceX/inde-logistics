import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
//import { streamToString } from './streamToString'; // Helper to convert stream to string

// Initialize the S3 client
const REGION = process.env.AWS_REGION || 'us-east-2'; // Replace with your preferred AWS region
const BUCKET_NAME = 'logistics.indejuice.com'; // Replace with your actual bucket name

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Uploads a file to S3 and returns the file URL or signed URL.
 * @param {string} s3Key - The key (path) to store the file in the bucket.
 * @param {string | Buffer | Uint8Array | Blob} fileContent - The content of the file to upload.
 * @param {string} [contentType='application/json'] - The content type of the file (default is JSON).
 * @returns {Promise<string>} - The URL or signed URL of the uploaded file.
 */
export const uploadToS3 = async (s3Key, fileContent, contentType = 'application/json') => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        // Generate a presigned URL for accessing the uploaded file if necessary
        const fileUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${s3Key}`;
        return fileUrl;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Failed to upload file to S3');
    }
};

/**
 * Retrieves an object from S3.
 * @param {string} s3Key - The key of the object in S3.
 * @returns {Promise<string | Buffer>} - The content of the file.
 */
export const getFileFromS3 = async (s3Key) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
    };

    try {
        const command = new GetObjectCommand(params);
        const response = await s3Client.send(command);

        // Convert the stream to a string (for JSON/text files)
        const fileContent = await streamToString(response.Body);
        return fileContent;
    } catch (error) {
        console.error('Error getting file from S3:', error);
        throw new Error('Failed to retrieve file from S3');
    }
};

/**
 * Helper function to convert a readable stream to a string.
 * @param {ReadableStream} stream - The readable stream from S3.
 * @returns {Promise<string>} - The string content of the stream.
 */
export const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
};

