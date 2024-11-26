'use client';

import styles from '@/styles/warehouse/packing/PackingItems.module.scss';
import React, { useContext } from 'react';
import { PackingAppContext } from '@/contexts/PackingAppContext';


export default function PackingItems() {
    const { order } = useContext(PackingAppContext);
    // console.log('order', order);

    return (
        <div className={styles.content}>
            <div className={styles.products}>
                {/* Product Item */}
                {/* // map it order.items */}
                {order.items.map((item, index) => (
                    <div key={index} className={styles.productItem}>
                        <div className={styles.imageContainer}>
                            {/* eslint-disable-next-line */}
                            <img
                                src={item.image}
                                alt={item.name}
                            />
                            <div className={styles.quantity}>x{item.quantity}</div>
                        </div>
                        <div className={styles.productDetails}>
                            <h3>{item.name}</h3>
                            {/* <p>{item.size} | {item.strength} | {item.ratio}</p> */}
                            <p>{item.brand_name}</p>
                            <p>
                                {Object.values(item.attributes || {})
                                    .filter(value => value && value.length > 0)
                                    .map(value => Array.isArray(value) ? value.join(', ') : value)
                                    .join(' | ')}
                            </p>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}
