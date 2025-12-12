import { createClient } from '@/lib/supabase/server'

export type Profile = {
   id: 
}

const UserManagementPage = async () => {
   const supabase = await createClient();
   const { data, error } = await supabase.from('profiles').select('*');
   console.log(data);
   if(error) {
      console.error(error);
   }
   return (
      <div>
         User Management Page
      </div>
   )
}

export default UserManagementPage