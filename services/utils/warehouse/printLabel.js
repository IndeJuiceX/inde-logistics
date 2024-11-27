import { sendPrintJob } from "@/services/external/printnode";
import { generateLabel } from "./courier";
import { stationPrinterMap } from "./stationPrinterMap";
export const generateAndPrintLabel = async (vendorId, orderId, stationId) => {
    const labelGenerateResponse = await generateLabel(vendorId, orderId)
    const printerId = stationPrinterMap[stationId]
    if (!printerId) {
        return { success: false, error: `Printer ID not found for station ID ${stationId}` };
    }

    // Proceed to print the label if label_url is available
    if (labelGenerateResponse.label_url) {
        const printResult = await printLabel(labelGenerateResponse.label_url, printerId);

        if (!printResult.success) {
            return { success: false, error: printResult.error || 'Failure in printing label' };
        }

        return { success: true, data: labelGenerateResponse };
    } else if (labelGenerateResponse.label_key) {
        // If label_key is available, implement logic to fetch from S3 and print
        // For now, return an error indicating this is not implemented
        return { success: false, error: 'Fetching label from S3 not implemented' };
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
