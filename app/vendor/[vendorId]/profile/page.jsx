'use server'
import Profile from "@/components/vendor/profile/Profile";
import { getUserProfile } from "@/services/data/user";
export default async function VendorProfilePage({ params }) {
    const vendorId = params.vendorId;
    let result = [];
    const profile = await getUserProfile(vendorId)
    if (profile.success) {
        result = profile.data
    }

    return <Profile vendorId={params.vendorId} profileData={result} />;
}
