export default function Status({ status }) {
    const statusClasses = {
        Accepted: 'bg-yellow-100 text-yellow-800',
        Dispatched: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
        Submitted: 'bg-blue-100 text-blue-800',
    };

    const classes = statusClasses[status] || 'bg-gray-100 text-gray-800';

    return (
        <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classes}`}
        >
            {status}
        </span>
    );
}