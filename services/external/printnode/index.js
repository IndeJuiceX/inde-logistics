export const sendPrintJob = async (printerId, base64Content) => {
    try {
      const printNodeApiKey = process.env.PRINTNODE_API_KEY;
      if (!printNodeApiKey) {
        throw new Error('PrintNode API key is not set');
      }
  
      const printJobData = {
        printerId: printerId,
        title: 'Shipping Label',
        contentType: 'pdf_base64',
        content: base64Content,
        source: 'YourAppName', // Replace with your application name
      };
  
      const authHeader = Buffer.from(`${printNodeApiKey}:`).toString('base64');
  
      const response = await fetch('https://api.printnode.com/printjobs', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printJobData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PrintNode API error: ${errorText}`);
      }
  
      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error sending print job:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  };
  