'use server'

import PickingApp from '@/components/warehouse/picking/PickingApp';
import React from 'react';

export default async function Layout({ children }) {
    return (
        <PickingApp>{children}</PickingApp>
    );
}