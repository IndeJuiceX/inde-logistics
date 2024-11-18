
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

// Build Sort Order Map dynamically from sortRules
export const buildSortOrderMap = (sortRules) => {
    const sortOrderMap = {};
    sortRules.forEach((rule) => {
        if (rule.condition === 'order' && rule.property === 'aisle') {
            rule.value.forEach((aisle, index) => {
                if (!sortOrderMap[aisle]) {
                    sortOrderMap[aisle] = rule.priority * 100 + index;
                }
            });
        }
    });
    return sortOrderMap;
};

// Process Custom Conditions
export const processCustomConditions = (orders, sortRules) => {
    const customConditions = sortRules.filter((rule) => rule.condition === 'custom');
    const customOrderItems = [];
    const remainingOrders = [...orders];

    customConditions.forEach((rule) => {
        const { aisle, aisle_number_range, positionAfter } = rule.value;
        const { start, end } = aisle_number_range;

        // Find orders that match the custom condition
        const matchingOrders = remainingOrders.filter(
            (order) =>
                order.warehouse.aisle === aisle &&
                parseInt(order.warehouse.aisle_number) >= start &&
                parseInt(order.warehouse.aisle_number) <= end
        );

        // Remove matching orders from remainingOrders
        matchingOrders.forEach((order) => {
            const index = remainingOrders.indexOf(order);
            if (index !== -1) {
                remainingOrders.splice(index, 1);
            }
        });

        // Store the matching orders along with their 'positionAfter' info
        customOrderItems.push({
            orders: matchingOrders,
            positionAfter,
        });
    });

    return { customOrderItems, remainingOrders };
};
// Main Sorting Function
export const sortOrders = (orders) => {
    // Build the sortOrderMap
    const sortOrderMap = buildSortOrderMap(sortRules);

    // Initial sort based on sortOrderMap and aisle_number
    let sortedOrders = [...orders].sort((a, b) => {
        const orderA = sortOrderMap[a.warehouse.aisle] || 9999; // Default high value if not specified
        const orderB = sortOrderMap[b.warehouse.aisle] || 9999;
        if (orderA !== orderB) {
            return orderA - orderB;
        } else {
            return parseInt(a.warehouse.aisle_number) - parseInt(b.warehouse.aisle_number);
        }
    });

    // Process custom conditions
    const { customOrderItems, remainingOrders } = processCustomConditions(sortedOrders, sortRules);

    // Now, insert the customOrderItems into remainingOrders at appropriate positions
    customOrderItems.forEach((customItem) => {
        const { orders: customOrders, positionAfter } = customItem;

        let insertIndex = -1;
        for (let i = remainingOrders.length - 1; i >= 0; i--) {
            if (positionAfter.includes(remainingOrders[i].warehouse.aisle)) {
                insertIndex = i + 1;
                break;
            }
        }

        if (insertIndex === -1) {
            insertIndex = 0;
        }

        remainingOrders.splice(insertIndex, 0, ...customOrders);
    });

    // Return the sorted orders
    return remainingOrders;
};