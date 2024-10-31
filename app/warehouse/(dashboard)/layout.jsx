
// create layout
import StockDashboard from '@/components/warehouse/dashboard/StockDashboard';
import React from 'react';

export default function Layout({ children }) {
    return (
        <StockDashboard>{children}</StockDashboard>
    );
}