import styles from '@/styles/warehouse/packing/PackingItems.module.scss';


export default function PackingItems({ image, name, details, quantity }) {
    return (
        <div className={styles.content}>
            <div className={styles.products}>
                {/* Product Item */}
                {["Cool Crush", "Avalanche", "Berry Blast"].map((product, index) => (
                    <div key={index} className={styles.productItem}>
                        <div className={styles.imageContainer}>
                            {/* eslint-disable-next-line */}
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
                ))}
            </div>
        </div>
    );
}
