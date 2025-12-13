import { createClient } from '@/lib/supabase/server'
import { DataTable } from './data-table'
import { columns } from './columns'

export type Profile = {
   age: number | null
   created_at: string | null
   email: string | null
   gender: string | null
   id: string
   name: string | null
   phone: string | null
   photo_url: string | null
   role: string | null
}

const UserManagementPage = async () => {
   const supabase = await createClient();
   const { data, error } = await supabase.from('profiles').select('*');
   console.log(data);
   if(error) {
      console.error(error);
   }
   return (
      <div className="container mx-auto py-10">
         <DataTable columns={columns} data={data} />
      </div>
   )
}

export default UserManagementPage