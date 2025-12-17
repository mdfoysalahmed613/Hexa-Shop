import BecomeDemoAdminClient from './become-demo-admin-client';
import { becomeDemoAdmin } from '@/app/actions/demo-admin';

const BecomeDemoAdmin = () => {
   return <BecomeDemoAdminClient onBecomeDemoAdmin={becomeDemoAdmin} />;
};

export default BecomeDemoAdmin;