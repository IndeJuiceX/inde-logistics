'use server'

import PickingApp from '@/components/warehouse/picking/PickingApp';
import React from 'react';

export default function Layout({ children }) {
    return (
        <PickingApp>{children}</PickingApp>
    );
}