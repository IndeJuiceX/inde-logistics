import RequestDetails from "@/components/vendor/api-logs/RequestDetails";


export default function RequestDetailsPage({ params }) {
    const logId = params.logId;
    const vendorId = params.vendorId;

    return (
        <RequestDetails logId={logId} vendorId={vendorId} />
    )
}