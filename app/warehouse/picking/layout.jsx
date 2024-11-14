'use server'

import PickingLayout from '@/components/warehouse/picking/PickingLayout';
import React from 'react';

export default async function Layout({ children }) {
    return (
        <PickingLayout>{children}</PickingLayout>
    );
}