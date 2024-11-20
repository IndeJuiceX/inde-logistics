import React from "react";
import styles from "@/styles/warehouse/packing/ParcelDetails.module.scss";

export default function ParcelDetails() {
    return (
        <div className={styles.parcelDetails}>
            <div className={styles.detailItem}>
                <div className={styles.detailValue}>10cm</div>
                <div className={styles.detailLabel}>LENGTH</div>
            </div>
            <div className={styles.detailItem}>
                <div className={styles.detailValue}>19.5cm</div>
                <div className={styles.detailLabel}>WIDTH</div>
            </div>
            <div className={styles.detailItem}>
                <div className={styles.detailValue}>2.4cm</div>
                <div className={styles.detailLabel}>HEIGHT</div>
            </div>
            <div className={styles.detailItem}>
                <div className={styles.detailValue}>290g</div>
                <div className={styles.detailLabel}>WEIGHT</div>
            </div>
            <div className={styles.detailItem}>
                <div className={styles.detailValue}>
                    <img
                    src="https://dev.indejuice.com/img/wh/print.png"
                    alt="Letter"
                />
                </div>
                <div className={styles.detailLabel}>LABEL</div>
            </div>

            {/* Actions */}
            {/* <div className={styles.actions}>
                <div className={`${styles.parcel} ${styles.small}`}>
                    <img
                        src="https://dev.indejuice.com/img/wh/parcel_small.png?v=2"
                        alt="Small Parcel"
                    />
                    SMALL PARCEL
                </div>
                <button className={`${styles.actionBtn} ${styles.confirm}`}>
                    <span>&#10003;</span>
                </button>
            </div> */}
        </div>
    );
}
