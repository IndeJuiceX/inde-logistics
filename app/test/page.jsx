
import { sortOrders } from '@/services/utils/customSorting';

export default function TestPage() {
    // Define your sort rules
    const sortRules = [
        { property: 'aisle', condition: 'order', value: ['★', 'Ψ', 'A', 'B', 'C'], priority: 1 },
        { property: 'aisle', condition: 'order', value: ['D', 'E', 'F'], priority: 2 },
        { property: 'aisle', condition: 'order', value: ['G', 'H', 'M', 'L'], priority: 3 },
        {
            property: 'aisle',
            condition: 'custom',
            value: {
                aisle: 'Z',
                aisle_number_range: { start: 1, end: 4 },
                positionAfter: ['★', 'Ψ', 'A', 'B', 'C'],
            },
            priority: 4,
        },
        {
            property: 'aisle',
            condition: 'custom',
            value: {
                aisle: 'Z',
                aisle_number_range: { start: 5, end: 9 },
                positionAfter: ['D', 'E', 'F'],
            },
            priority: 5,
        },
        // ... add more rules as needed
    ];



  
  

    // Sample data
    const sampleOrders = [
        { ID: 1, warehouse: { aisle: 'B', aisle_number: '2' } },
        { ID: 2, warehouse: { aisle: 'D', aisle_number: '1' } },
        { ID: 3, warehouse: { aisle: 'Z', aisle_number: '3' } },
        { ID: 4, warehouse: { aisle: 'Z', aisle_number: '6' } },
        { ID: 5, warehouse: { aisle: 'G', aisle_number: '1' } },
        { ID: 6, warehouse: { aisle: 'A', aisle_number: '1' } },
        { ID: 7, warehouse: { aisle: 'E', aisle_number: '3' } },
        { ID: 8, warehouse: { aisle: 'M', aisle_number: '2' } },
        { ID: 9, warehouse: { aisle: '★', aisle_number: '1' } },
        { ID: 10, warehouse: { aisle: 'Ψ', aisle_number: '1' } },
        // ... more sample orders
    ];

    // Sort the orders
    const sortedOrders = sortOrders(sampleOrders, sortRules);

    return (
        <div>
            <h1>Test Page</h1>
            <p>Sorted Orders:</p>
            <ul>
                {sortedOrders.map((order) => (
                    <li key={order.ID}>
                        <strong>ID:</strong> {order.ID}, <strong>Aisle:</strong> {order.warehouse.aisle},{' '}
                        <strong>Aisle Number:</strong> {order.warehouse.aisle_number}
                    </li>
                ))}
            </ul>
        </div>
    );
}