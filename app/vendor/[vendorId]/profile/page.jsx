'use server'
import Profile from "@/components/vendor/profile/Profile";

export default async function VendorProfilePage({ params }) {
    
    return <Profile vendorId={params.vendorId} />;
}
