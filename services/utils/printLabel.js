import { sendPrintJob } from "@/services/external/printnode";
import { generateLabel } from "./courier";
export const generateAndPrintLabel = async(vendorId,orderId) =>{
    const labelGenerateResponse = await generateLabel(vendorId,orderId)
    if(!labelGenerateResponse.success) {
        return {success:false, error : labelGenerateResponse.error || 'Failure in generating label'}
    }
    if(labelGenerateResponse?.success && labelGenerateResponse.label_url) {
        const result = await printLabel(labelGenerateResponse.label_url,)
    }else if(labelGenerateResponse?.success && labelGenerateResponse.label_key) {
        //fetch label from s3 and pass it for the printing.. 
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
