import CreateUser from '@/components/admin/users/CreateUser';
import { getAllVendors } from '@/services/data/vendor';
import { cleanResponseData } from '@/services/utils';

export default async function CreateUserPage() {
  let vendors = [];
  const response = await getAllVendors();

  if (response.success) {
    vendors = cleanResponseData(response.data);
  }
  else {
    console.error('Error fetching vendors:', response.error);
  }

  return (
    <CreateUser vendorsData={vendors} />
  );
};

