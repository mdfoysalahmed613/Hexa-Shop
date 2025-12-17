import BecomeDemoAdminClient from './become-demo-admin-client';
import { becomeDemoAdmin } from '@/lib/auth/demo-admin';

const BecomeDemoAdmin = () => {
   return <BecomeDemoAdminClient onBecomeDemoAdmin={becomeDemoAdmin} />;
};

export default BecomeDemoAdmin;