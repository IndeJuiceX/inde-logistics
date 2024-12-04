'use client'

import styles from "@/styles/warehouse/packing/ParcelDetails.module.scss";
import PackingKeyPad from "@/components/warehouse/packing/PackingKeyPad";
import { usePackingAppContext } from "@/contexts/PackingAppContext";
import LabelPrintButton from "@/components/warehouse/packing/LabelPrintButton";
import PickedAndLabeled from "@/components/warehouse/packing/PickedAndLabeled";
export default function ParcelDetails() {
    const { order, packedData, setPackedData, isOpenModal, setIsOpenModal, currentClicked, setCurrentClicked, enteredValue, setEnteredValue, isValidForPrintLabel, setIsValidForPrintLabel, isGeneratedLabel, isReadyForDispatch } = usePackingAppContext();


    const handleCustomSize = (currentClick) => {
        if (isGeneratedLabel) {
            return;
        }

        setIsValidForPrintLabel(false);
        setPackedData(prevState => ({
            ...prevState,
            courier: {
                ...prevState.courier,
                [currentClick]: 0
            }
        }));
        if (currentClicked === currentClick) {
            setCurrentClicked('');
        } else {
            setCurrentClicked(currentClick);
        }
        setEnteredValue('');

        setIsOpenModal(true);
    }

    const depth = isGeneratedLabel ? order?.shipment?.length : packedData?.courier?.depth;
    const width = isGeneratedLabel ? order?.shipment?.width : packedData?.courier?.width;
    const length = isGeneratedLabel ? order?.shipment?.height : packedData?.courier?.length;
    const weight = isGeneratedLabel && order?.shipment?.weight_grams != null ? order.shipment.weight_grams : packedData?.courier?.weight;

    return (
        <div className={styles.parcelDetails}>
            {!isReadyForDispatch && (
                <>
                    <div className={styles.detailItem} onClick={() => handleCustomSize('depth')}>
                        <div className={styles.detailValue}>{depth ? depth : 0}cm</div>
                        <div className={styles.detailLabel}>LENGTH</div>
                    </div>
                    <div className={styles.detailItem} onClick={() => handleCustomSize('width')}>
                        <div className={styles.detailValue}>{width ? width : 0}cm</div>
                        <div className={styles.detailLabel}>WIDTH</div>
                    </div>
                    <div className={styles.detailItem} onClick={() => handleCustomSize('length')}>
                        <div className={styles.detailValue}>{length ? length : 0}cm</div>
                        <div className={styles.detailLabel}>HEIGHT</div>
                    </div>
                </>
            )}
            <div className={styles.detailItem} onClick={() => handleCustomSize('weight')}>
                <div className={styles.detailValue}>{weight ? weight : 0}g</div>
                <div className={styles.detailLabel}>WEIGHT</div>
            </div>

            {isValidForPrintLabel && (
                <LabelPrintButton styles={styles} />
            )}
            {isReadyForDispatch && (
                <PickedAndLabeled />
            )}
            <PackingKeyPad enteredValue={enteredValue} setEnteredValue={setEnteredValue} setIsOpenModal={setIsOpenModal} isOpenModal={isOpenModal} />
        </div>
    );
}
