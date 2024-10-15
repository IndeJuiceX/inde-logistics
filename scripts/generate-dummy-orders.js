const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker/locale/en_GB'); // Use the UK locale directly

const TOTAL_ORDERS=10;
// Path to the JSON file where orders will be written
const filePath = path.join(__dirname, 'orders.json');

// Function to generate a random buyer object with UK address
const generateBuyer = () => ({
    name: faker.person.fullName(),
    phone: faker.phone.number('+44 ## #### ####'), // UK phone format
    email: faker.internet.email(),
    address_line_1: faker.location.streetAddress(),
    address_line_2: faker.location.secondaryAddress(),
    address_line_3: faker.location.street(),
    address_line_4: faker.location.state(),
    city: faker.location.city(),
    postcode: faker.location.zipCode('??# #??'), // UK postcode format
    country: "United Kingdom",
});

// Function to generate a random item object
const generateOrderItem = (i) => ({
    vendor_sku: `SKU${i}`,
    quantity: Math.floor(Math.random() * 100) + 1, // Random quantity between 1 and 100
    sales_value: parseFloat(faker.commerce.price()), // Random sales value using faker
});

// Function to generate an order object
const generateOrder = (i) => ({
  vendor_order_id: `ORDER${i}`,
  expected_delivery_date: faker.date.future().toISOString().split('T')[0], // Random future date
  shipping_cost: faker.commerce.price(), // Random shipping cost
  buyer: generateBuyer(),
  items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, index) => generateOrderItem(index + 1)) // Random 1-5 items
});

// Generate 100 orders
const orders = [];
for (let i = 1; i <= TOTAL_ORDERS; i++) {
  orders.push(generateOrder(i));
}

// Write the orders array to the JSON file
fs.writeFile(filePath, JSON.stringify({ orders: orders }, null, 2), (err) => {
  if (err) {
    console.error('Error writing file:', err);
    return;
  }

  console.log('Orders generated and written to file.');

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
