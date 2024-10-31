'use client';
import { useState } from 'react';
import Modal from '@/components/warehouse/modal/Modal';

export default function Shipment() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div>
            <h1>Shipment Page</h1>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => setIsModalOpen(true)}
            />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ul>
                    <li class="pb-3 text-gray-600 font-semibold text-lg">All New Shipments</li>
                    <li class="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                        <span>04 Liquids</span>
                        <span class="text-sm text-gray-500">VAPERBAR CHEL...</span>
                    </li>
                    <li class="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                        <span>10ml by P&S</span>
                        <span class="text-sm text-gray-500">SAVVY VAPES LTD</span>
                    </li>
                    <li class="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                        <span>2Tasty Vape Co</span>
                        <span class="text-sm text-gray-500">KUBEK LTD</span>
                    </li>
                    <li class="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                        <span>3 Fruits</span>
                        <span class="text-sm text-gray-500">4 VAPE LIMITED</span>
                    </li>
                    <li class="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                        <span>7 DAZE</span>
                        <span class="text-sm text-gray-500">PMP DISTRIBUT...</span>
                    </li>
                    <li class="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                        <span>A Star Vape</span>
                        <span class="text-sm text-gray-500">A STAR LIQUID LTD</span>
                    </li>
                    <li class="flex justify-between py-3 text-gray-800 hover:bg-gray-100 cursor-pointer text-base border-b border-gray-200">
                        <span>A Steam</span>
                        <span class="text-sm text-gray-500">OPLUS VAPE LTD</span>
                    </li>
                </ul>
            </Modal>
        </div>
    )
}