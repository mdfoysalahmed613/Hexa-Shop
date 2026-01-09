/**
 * User Orders Page
 *
 * Displays the current user's order history.
 * Server component that wraps the client component for data fetching.
 */

import { OrdersPageContent } from "./_components/orders-page-content";

export const metadata = {
   title: "My Orders | Hexa Shop",
   description: "View and track your order history",
};

export default function OrdersPage() {
   return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
         <div className="mb-8">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">
               View and track your order history
            </p>
         </div>
         <OrdersPageContent />
      </div>
   );
}
