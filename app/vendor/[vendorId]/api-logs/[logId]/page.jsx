import RequestDetails from "@/components/vendor/api-logs/RequestDetails";


export default function RequestDetailsPage({ params }) {
    const logId = params.logId;
    return (
        <RequestDetails logId={logId} />
    )
}