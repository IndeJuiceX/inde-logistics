

export default function Locations({ styles, location }) {
    // console.log('location', location);

    // const colors = {
    //     G: 'bg-green-500 text-white',
    //     W: 'bg-gray-200 text-gray-700',
    //     BK: 'bg-black text-white',
    //     R: 'bg-red-500 text-white',
    //     B: 'bg-blue-500 text-white',
    //     GY: 'bg-gray-500 text-white',
    //     O: 'bg-orange-500 text-white',
    //     W2: 'bg-gray-300 text-gray-700',
    //     R2: 'bg-red-600 text-white',
    //     B2: 'bg-blue-600 text-white',
    //     Y: 'bg-yellow-400 text-gray-700',
    //     P: 'bg-pink-300 text-gray-700',
    //     LI: 'bg-purple-300 text-white',
    // };

    const colors = {
        G: 'bg-green-500 text-white',
        W: 'bg-gray-200 text-gray-700',
        BK: 'bg-black text-white',
        R: 'bg-red-500 text-white',
        B: 'bg-blue-500 text-white',
        GY: 'bg-gray-500 text-white',
        O: 'bg-orange-500 text-white',
        W2: 'bg-gray-300 text-gray-700',
        R2: 'bg-red-600 text-white',
        B2: 'bg-blue-600 text-white',
        Y: 'bg-yellow-400 text-gray-700',
        P: 'bg-pink-300 text-gray-700',
        LI: 'bg-purple-300 text-white',
    };
    return (
        <div className={styles.locationDetails}>
            <div className={`${styles.locationItem} ${styles.width5rem}`}>A</div> {/* Aisle */}
            <div className={`${styles.locationItem} ${styles.width5rem}`}>2</div> {/* Aisle Number */}
            <div className={`${styles.locationItem} ${styles.width5rem} ${styles[location.shelf]}`}>4</div> {/* Shelf */}
            <div className={`${styles.locationItem} ${styles.width5rem} ${styles[location.shelf]}`}>A</div> {/* Shelf Number */}
        </div>
    )
}