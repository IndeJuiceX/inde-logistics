const fs = require('fs');
const path = require('path');

// Path to the JSON file where products will be written
const filePath = path.join(__dirname, 'stock-shipment.json');

// Function to generate a product object
const generateStockShipment = (i) => ({
  vendor_sku: `SKU${i}`,
  stock_in: Math.floor(Math.random() * 100), // Random stock between 0 and 100
 
});

// Generate 500 products
const stock_shipment = [];
for (let i = 1; i <= 100; i++) {
  stock_shipment.push(generateStockShipment(i));
}

// Write the products array to the JSON file
fs.writeFile(filePath, JSON.stringify({ stock_shipment: stock_shipment }, null, 2), (err) => {
  if (err) {
    console.error('Error writing file:', err);
    return;
  }

  console.log('stock shipment generated and written to file.');

  // Check the file size
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error('Error reading file size:', err);
      return;
    }

    const fileSizeInBytes = stats.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    console.log(`File size: ${fileSizeInBytes} bytes`);
    console.log(`File size: ${fileSizeInMB.toFixed(2)} MB`);
  });
});
