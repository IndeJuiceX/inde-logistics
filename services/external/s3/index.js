import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

        // Check if the response body is a ReadableStream or Blob
        if (response.Body instanceof ReadableStream) {
            // Convert ReadableStream to string (for Node.js environment)
            const fileContent = await streamToString(response.Body);
            return fileContent;
        } else if (response.Body instanceof Blob) {
            // Convert Blob to string (for browser environment)
            const text = await response.Body.text();
            return text;
        } else {
            throw new Error('Unsupported response body type');
        }
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
export const streamToString = async (stream) => {
    if (typeof window !== 'undefined') {
        // Handle browser environment (ReadableStream or Blob)
        if (stream instanceof Blob) {
            // If it's a Blob, read it as text
            return await stream.text();
        } else if (stream instanceof ReadableStream) {
            // If it's a ReadableStream, convert it to text
            const reader = stream.getReader();
            let result = '';
            let decoder = new TextDecoder('utf-8');
            let done, value;

            while (!done) {
                const { done: doneReading, value: chunk } = await reader.read();
                done = doneReading;
                if (chunk) {
                    result += decoder.decode(chunk, { stream: true });
                }
            }

            result += decoder.decode(); // End of the stream
            return result;
        }
    } else if (typeof stream.on === 'function') {
        // Handle Node.js stream
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        });
    }

    // Handle unexpected cases
    throw new Error('Unsupported stream type');
};



export const getLabelPresignedUrl = async (s3Key) => {
  const LABEL_REGION = 'us-east-2'; // Label bucket region
  const LABEL_BUCKET_NAME = 'shipping-labels.indejuice.com'; // Label bucket name

  const s3ClientForLabels = new S3Client({
    region: LABEL_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const params = {
    Bucket: LABEL_BUCKET_NAME,
    Key: s3Key,
  };

  try {
    const command = new GetObjectCommand(params);
    // Generate a presigned URL valid for 15 minutes
    const signedUrl = await getSignedUrl(s3ClientForLabels, command, { expiresIn: 900 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating presigned URL for label:', error);
    throw new Error('Failed to generate presigned URL for label');
  }
};

