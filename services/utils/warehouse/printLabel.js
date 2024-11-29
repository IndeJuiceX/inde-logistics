'use server'
import { sendPrintJob } from "@/services/external/printnode";
import { generateLabel } from "@/services/utils/warehouse/courier";
import { stationPrinterMap } from "@/services/utils/warehouse/stationPrinterMap";
import { getLabelPresignedUrl } from "@/services/external/s3";


export const generateAndPrintLabel = async (vendorId, orderId, stationId) => {
    return { success: true, data: {} };
    const labelGenerateResponse = await generateLabel(vendorId, orderId)
    const printerId = stationPrinterMap[stationId]
    if (!printerId) {
        return { success: false, error: `Printer ID not found for station ID ${stationId}` };
    }

    // Proceed to print the label if label_url is available
    if (labelGenerateResponse?.label_url) {
        const printResult = await printLabel(labelGenerateResponse.label_url, printerId);

        if (!printResult.success) {
            return { success: false, error: printResult.error || 'Failure in printing label' };
        }

        return { success: true, data: labelGenerateResponse };
    } else if (labelGenerateResponse?.label_key) {
        // Generate a presigned URL and print the label
        try {
            // Generate a presigned URL for the label
            const presignedUrl = await getLabelPresignedUrl(labelGenerateResponse.label_key);

            // Use the existing printLabel function with the presigned URL
            const printResult = await printLabel(presignedUrl, printerId);

            if (!printResult.success) {
                return { success: false, error: printResult.error || 'Failure in printing label from S3' };
            }

            // Optionally, update labelGenerateResponse to include the label_url
            labelGenerateResponse.label_url = presignedUrl;

            return { success: true, data: labelGenerateResponse };
        } catch (error) {
            console.error('Error generating presigned URL or printing label from S3:', error);
            return { success: false, error: error.message || 'Error printing label from S3' };
        }
    } else {
        // If neither label_url nor label_key is available, return an error
        return { success: false, error: 'Label URL or key is missing' };
    }
}
export const printLabel = async (labelUrl, printerId) => {
    try {
        // Step 1: Fetch the label content
        const buffer = await fetchLabelContent(labelUrl);

        // Step 2: Encode to Base64
        const base64Content = encodeToBase64(buffer);

        // Step 3: Send the print job to PrintNode
        const printResult = await sendPrintJob(printerId, base64Content);

        return printResult;
    } catch (error) {
        console.error('Error in printLabel:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};
const fetchLabelContent = async (labelUrl) => {
    try {
        const response = await fetch(labelUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch label content');
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('Error fetching label content:', error);
        throw error;
    }
};
const encodeToBase64 = (buffer) => {
    return buffer.toString('base64');
};
