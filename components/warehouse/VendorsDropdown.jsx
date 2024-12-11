'use client';
import { useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Modal from '@/components/warehouse/modal/Modal';
import { FaCaretDown } from 'react-icons/fa';
import styles from '@/styles/warehouse/stock-app/shipments.module.scss'
import { urlFormatter } from '@/services/utils/index';
import { useGlobalContext } from '@/contexts/GlobalStateContext';

export default function VendorsDropdown({ vendors, vendor_id }) {
    const { setLoading, setLoaded } = useGlobalContext();

    const router = useRouter();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allVendors, setAllVendors] = useState(vendors);


    const handleGetAllVendors = async () => {
        setIsModalOpen(true);
    }

    const loadShipments = (vendorId) => async () => {
        if (!vendorId) {
            return;
        }
        setLoading(true);
        const newPath = urlFormatter(pathname, vendorId);
        router.push(newPath);
        setIsModalOpen(false);
    }
    const findVendor = (vendorId) => {
        const vendor = allVendors.find(vendor => vendor.vendor_id === vendorId);
        return vendor ? vendor.company_name : 'All Vendors';
    }
    return (
        <>
            <div className={styles.vendorSelector}>
                <span onClick={handleGetAllVendors} className={styles.vendor}>
                    <span>{findVendor(vendor_id)}</span>
                    <span className={styles.downArrow}><FaCaretDown /></span>
                </span>
                <span className="flex-grow"></span>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ul>
                    <li className="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200" onClick={loadShipments('all')}>All Vendors</li>

                    {allVendors.length > 0 ? allVendors.map((vendor, index) => (
                        <li key={index} className="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200" onClick={loadShipments(vendor.vendor_id)}>
                            <span>{vendor.company_name}</span>
                            {/* <span className="text-sm text-gray-500">{vendor.location}</span> */}
                        </li>
                    )) : <li className="text-gray-600">No vendors found</li>}
                </ul>
            </Modal>
        </>
    )
}