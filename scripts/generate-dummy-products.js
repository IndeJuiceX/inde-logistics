const fs = require('fs');
const path = require('path');

// Path to the JSON file where products will be written
const filePath = path.join(__dirname, 'products.json');

// Function to generate a product object
const generateProduct = (i) => ({
  VendorSku: `SKU${i}`,
  Status: 'Active',
  Stock: Math.floor(Math.random() * 100), // Random stock between 0 and 100
  Details: {
    Name: `Product ${i}`,
    CostPrice: (Math.random() * 100).toFixed(2), // Random cost price
    SalePrice: (Math.random() * 150).toFixed(2), // Random sale price
    BrandName: `Brand ${i}`,
    Image: `https://example.com/image${i}.jpg`,
    Attributes: {
      Color: ['Red', 'Blue', 'Green'][Math.floor(Math.random() * 3)], // Random color
      Size: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)], // Random size
      Material: ['Cotton', 'Polyester', 'Wool'][Math.floor(Math.random() * 3)], // Random material
    }
  }
});

// Generate 500 products
const products = [];
for (let i = 1; i <= 5000; i++) {
  products.push(generateProduct(i));
}

// Write the products array to the JSON file
fs.writeFile(filePath, JSON.stringify({ Products: products }, null, 2), (err) => {
  if (err) {
    console.error('Error writing file:', err);
    return;
  }

  console.log('500 products generated and written to file.');

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
