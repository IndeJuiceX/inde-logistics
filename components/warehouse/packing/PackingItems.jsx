'use client';

import styles from '@/styles/warehouse/packing/PackingItems.module.scss';
import React, { useContext } from 'react';
import { PackingAppContext } from '@/contexts/PackingAppContext';


export default function PackingItems() {
    const { order } = useContext(PackingAppContext);
    console.log('order', order);

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


                {/* {["Cool Crush", "Avalanche", "Berry Blast"].map((product, index) => (
                    <div key={index} className={styles.productItem}>
                        <div className={styles.imageContainer}>
                             //eslint-disable-next-line 
                            <img
                                src="https://cdn.indejuice.com/images/GvS.jpg"
                                alt={product}
                            />
                            <div className={styles.quantity}>x1</div>
                        </div>
                        <div className={styles.productDetails}>
                            <h3>{product}</h3>
                            <p>10ml | 3mg | 70VG/30PG</p>
                        </div>
                    </div>
                ))}*/}
            </div>
        </div>
    );
}
