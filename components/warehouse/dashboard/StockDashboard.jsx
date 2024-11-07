import PageSpinner from "@/components/loader/PageSpinner";
import TapMenu from "@/components/warehouse/dashboard/TapMenu";
import { GlobalStateProvider } from "@/contexts/GlobalStateContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import ErrorModal from "@/components/warehouse/errorModal/ErrorModal";
import GlobalProductLoad from "@/components/warehouse/GlobalProductLoad";

export default function StockDashboard({ children }) {

    return (
        // <LoadingProvider>
        <GlobalStateProvider>
            <div className="bg-gray-900 min-h-screen p-6 text-white">
                <TapMenu />
                <PageSpinner />
                <ErrorModal />
                <GlobalProductLoad />
                {children}
            </div>
        </GlobalStateProvider>
        // </LoadingProvider>
    );
}