'use client';

import { usePickingAppContext } from '@/contexts/PickingAppContext';




export default function NewOrders({ testing }) {
    // const { handleSignOut } = usePickingAppContext();

    console.log('testing', testing);
    /// get the 1000 recodrds from this testing array
    const orders = testing.data.filter(item => item.warehouse).slice(0, 25);
    console.log('orders', orders);

    const sortRules = [
        { property: 'warehouse.aisle', condition: 'order', value: ['★', 'Ψ', 'A', 'B', 'C'], priority: 1 },
        { property: 'warehouse.aisle', condition: 'order', value: ['D', 'E', 'F'], priority: 2 },
        { property: 'warehouse.aisle', condition: 'order', value: ['G', 'H', 'M', 'L'], priority: 3 },
        { property: 'warehouse.aisle', condition: 'custom', value: { specific: 'Z', column: 'warehouse.aisle_number', start: '5', end: '7' }, priority: 0 }
    ];

    const dynamicSort = (a, b) => {
        // Sort by aisle based on priority
        for (const rule of sortRules) {
            // If condition is "order" and the aisle exists in the value array, sort by priority
            if (rule.condition === 'order') {
                // console.log('rule a', a);

                // if(!a?.warehouse || !b?.warehouse) return 0;
                // if(!b?.warehouse?.aisle || !b?.warehouse?) return 0;
                
                const indexA = rule.value.indexOf(a.warehouse.aisle);
                const indexB = rule.value.indexOf(b.warehouse.aisle);

                // If both aisles are found in the value array, compare them
                if (indexA !== -1 && indexB !== -1) {
                    if (indexA < indexB) return -1; // a comes first
                    if (indexA > indexB) return 1;  // b comes first
                }
            }
        }

        // Special sorting for aisle "Z" and aisle_number
        const aisleNumberA = parseInt(a.warehouse.aisle_number);
        const aisleNumberB = parseInt(b.warehouse.aisle_number);

        // If aisle is "Z", we need to handle aisle_number sorting
        if (a.warehouse.aisle === 'Z' && b.warehouse.aisle === 'Z') {
            if (aisleNumberA < aisleNumberB) return -1;
            if (aisleNumberA > aisleNumberB) return 1;
        }

        return 0; // Default return if no condition met
    };


    const sortedProducts = orders.sort(dynamicSort);
    console.log('sorted orders',sortedProducts);
    return (
        <div>
            <h1>New Orders</h1>

            {/* <button onClick={handleSignOut}>Sign Out</button> */}

        </div>
    )
}