import Breadcrumbs from '@/components/layout/common/Breadcrumbs';

export default function Profile() {
    const profileData = {
        companyName: "Acme Corporation",
        companyNumber: "123456789",
        phone: "+1-800-555-0199",
        email: "contact@acmecorp.com",

    };
    const breadcrumbs = [
        { text: 'Home', url: '/' },
        { text: 'Profile' },
    ];
    return (
        <>
            <Breadcrumbs breadcrumbs={breadcrumbs} />

            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Profile Details</h1>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                    <input type="text" name="companyName" value={profileData.companyName} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Company Number:</label>
                    <input type="text" name="companyNumber" value={profileData.companyNumber} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                    <input type="text" name="phone" value={profileData.phone} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <input type="email" name="email" value={profileData.email} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>

            </div>
        </>
    );
}