import RequestLogs from "@/components/vendor/api-logs/RequestLogs";


export default async function ApiLogsPage({ params }) {
    const vendorId = params.vendorId;
    const sampleData = [{
        vendor_id: 'b71812ec',
        user: 'vendor@indejuice.com',
        endpoint: '/api/v1/vendor/orders',
        method: 'GET',
        request_data: {
            url: 'http://localhost:3000/api/v1/vendor/orders?page_size=25',
            method: 'GET',
            params: { page_size: '25' }
        },
        response_data: '{"data":[{"updated_at":"2024-10-24T10:23:14.572Z","buyer":{"country":"string","phone":"string","city":"string","name":"string","address_line_1":"string","postcode":"string","address_line_3":"string","address_line_2":"string","address_line_4":"string","email":"user@example.com"},"created_at":"2024-10-24T10:23:14.572Z","shipping_cost":0,"status":"Accepted","vendor_order_id":"12312","order_id":"0a5c31c7","vendor_id":"b71812ec","expected_delivery_date":"31/12/2023"},{"updated_at":"2024-10-24T10:25:49.346Z","buyer":{"country":"string","phone":"string","city":"string","name":"string","address_line_1":"string","postcode":"string","address_line_3":"string","address_line_2":"string","address_line_4":"string","email":"user@example.com"},"created_at":"2024-10-24T10:25:49.346Z","shipping_cost":0,"status":"Accepted","vendor_order_id":"123121","order_id":"16b34ff5","vendor_id":"b71812ec","expected_delivery_date":"31/12/2023"},{"updated_at":"2024-10-24T10:31:00.388Z","buyer":{"country":"string","phone":"string","city":"string","name":"string","address_line_1":"string","postcode":"string","address_line_3":"string","address_line_2":"string","address_line_4":"string","email":"user@example.com"},"created_at":"2024-10-24T10:31:00.388Z","shipping_cost":0,"status":"Accepted","vendor_order_id":"12312122","order_id":"761737f1","vendor_id":"b71812ec","expected_delivery_date":"31/12/2022"},{"updated_at":"2024-10-24T10:32:41.681Z","buyer":{"country":"string","phone":"string","city":"string","name":"string","address_line_1":"string","postcode":"string","address_line_3":"string","address_line_2":"string","address_line_4":"string","email":"user@example.com"},"created_at":"2024-10-24T10:32:41.681Z","shipping_cost":0,"status":"Accepted","vendor_order_id":"1231213","order_id":"bd87f4ec","vendor_id":"b71812ec","expected_delivery_date":"31/12/2022"},{"updated_at":"2024-10-21T16:11:52.326Z","buyer":{"country":"United Kingdom","phone":"025 4095 0332","city":"West Hueling","name":"Jackie Turner","address_line_1":"524 Claremont Road","postcode":"XS2 6UA","address_line_3":"Nightingale Close","address_line_2":"Suite 259","address_line_4":"England","email":"Bo.Wilkinson12@yahoo.com"},"created_at":"2024-10-21T16:05:15.342Z","shipping_cost":592.85,"status":"Cancelled","vendor_order_id":"322ED4R","order_id":"3b25944a","expected_delivery_date":"20/10/2024","vendor_id":"b71812ec"},{"updated_at":"2024-10-23T10:29:49.787Z","buyer":{"country":"string","phone":"string","city":"string","name":"string","address_line_1":"string","postcode":"string","address_line_3":"string","address_line_2":"string","address_line_4":"string","email":"user@example.com"}}],"success":true,"hasMore":false}',
        status: 200,
        timestamp: '2024-10-24T13:57:49.027Z',
        duration_ms: 275,
        error: false,
        log_type: 'vendor',
        environment: 'local'
    }]

    return (
        <RequestLogs data={sampleData} vendorId={vendorId} />
    )
}