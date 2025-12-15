// import { createClient } from '@/lib/supabase/server'
// import { DataTable } from './data-table'
// import { columns } from './columns'
// import { adminAuthClient } from '@/lib/supabase/supabase-admin'

// export type Profile = {
//    age: number | null
//    created_at: string | null
//    email: string | null
//    gender: string | null
//    id: string
//    name: string | null
//    phone: string | null
//    photo_url: string | null
//    role: string | null
// }

// const UserManagementPage = async () => {
//    const { data : {users},error } = await adminAuthClient.listUsers();
//    console.log(users);
//    if(error) {
//       console.error(error);
//    // 
//    return (
//       <div className="mx-auto py-10">
//          {/* <DataTable columns={columns} data={data} /> */}
//       </div>
//    )
// }

// export default UserManagementPage