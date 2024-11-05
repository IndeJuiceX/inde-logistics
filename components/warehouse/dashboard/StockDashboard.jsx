import PageSpinner from "@/components/loader/PageSpinner";
import TapMenu from "@/components/warehouse/dashboard/TapMenu";
import { LoadingProvider } from "@/contexts/LoadingContext";

export default function StockDashboard({ children }) {
    return (
        <LoadingProvider>
            <div className="bg-gray-900 min-h-screen p-6 text-white">
                <TapMenu />
                <PageSpinner />
                {children}
            </div>
        </LoadingProvider>
    );
}