import {auth} from '@/auth';

export default async function HomePage() {
  const session = await auth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        {/* Heading Section */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to IndeJuice Logistics
          <pre>{JSON.stringify(session,null,2)}</pre>
        </h1>

        {/* Buttons Section */}
        <div className="flex justify-center space-x-4 mt-6">
          {/* Vendor Signup Button */}
          <a
            href="/vendor/onboarding"
            className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Vendor Signup
          </a>

          {/* Vendor Sign In Button */}
          <a
            href="/login"
            className="bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 transition duration-300"
          >
            Vendor Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
