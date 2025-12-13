import { createClient } from '@/lib/supabase/server'

const Practice = async () => {
   const supabase = await createClient();
   // const { data: claimsData } = await supabase.auth.getClaims();
   // const claims = claimsData?.claims;
   const { data, error } = await supabase.auth.getUser();
   console.log(data);
   if(error) {
      console.error(error);
   }
   return (
      <div>Practice</div>
   )
}

export default Practice