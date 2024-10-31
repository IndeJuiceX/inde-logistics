import TapMenu from "@/components/warehouse/dashboard/TapMenu";

export default function StockDashboard({ children }) {
    return (
        <div className="bg-gray-900 min-h-screen p-6 text-white">
            <TapMenu />
            {children}
        </div>
    );
}