import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // Optional, for signed URLs

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
 * Optionally, you can also add a function to generate a presigned URL for download purposes.
 * 
 * @param {string} s3Key - The key of the object you want to get a presigned URL for.
 * @param {number} [expiresIn=3600] - The number of seconds the URL is valid for (default is 1 hour).
 * @returns {Promise<string>} - The presigned URL.
 */
export const getPresignedUrl = async (s3Key, expiresIn = 3600) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
    };

    const command = new GetObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
};
