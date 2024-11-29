import PickingAppModal from '@/components/warehouse/modal/PickingAppModal';

export default function RequireAttention({ styles }) {

    return (
        <>
            <div className={`${styles.action} ${styles.customSize} `}>

                {/* eslint-disable-next-line */}
                <img
                    src="https://dev.indejuice.com/img/wh/warning.png"
                    alt="Extra Large Parcel"
                />
                REQUIRES ATTENTION
            </div>
            {/* <PickingAppModal isOpen={isOpen} onClose={() => setIsOpen(false)} styles={'noOrder'}>
                <div>
                    <p>Please re-scan the barcode for confirmation</p>
                </div>
            </PickingAppModal> */}
        </>
    )
}