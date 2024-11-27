import Users from '@/components/admin/users/Users';
import { getAllUsers } from '@/services/data/user';

export default async function UsersPage() {
  let users = [];
  const result = await getAllUsers();
  if (result.success) {
    users = result.data;
  }
  return (
    <Users usersData={users} />
  );
}


