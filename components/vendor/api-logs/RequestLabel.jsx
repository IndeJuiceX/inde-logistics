export default function RequestLabel({ type, value }) {
    const styles = {
        method: {
            POST: "bg-blue-100 text-blue-500",
            GET: "bg-green-100 text-green-500",
            PUT: "bg-yellow-100 text-yellow-500",
            DELETE: "bg-red-100 text-red-500",
        },
        status: {
            200: "bg-green-100 text-green-500",
            201: "bg-green-100 text-green-500",
            400: "bg-yellow-100 text-yellow-600",
            404: "bg-orange-100 text-orange-500",
            500: "bg-red-100 text-red-500",
        },
    };

    return (
        <>
            <span className={`rounded inline-block px-3 py-1 text-sm font-medium ${styles[type][value] || "bg-gray-100 text-gray-500"}`}>
                {value}
            </span>
        </>
    );
}
