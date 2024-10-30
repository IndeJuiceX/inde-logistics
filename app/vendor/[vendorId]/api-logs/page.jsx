import RequestLogs from "@/components/vendor/api-logs/RequestLogs";


export default async function ApiLogsPage({ params }) {
    const vendorId = params.vendorId;
  

    return (
        <RequestLogs  vendorId={vendorId} />
    )
}