import React, { Children } from 'react';
import styles from '@/styles/warehouse/modals/PickingAppModal.module.scss';

export default function PickingAppModal({ isOpen, onClose, children }) {

    if (!isOpen) return null;
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                {/* <div className={styles.iconContainer}>
                    <div className={styles.checkmark}>✔</div>
                </div>
                <h2 className={styles.modalTitle}>Place Container 1 In Queue</h2>
                <button className={styles.primaryButton} onClick={onComplete}>Complete</button>
                <button className={styles.secondaryButton} onClick={onCompleteAndLogout}>
                    Complete & Logout
                </button> */}
                {children}
            </div>
        </div>
    );
}