# Hexa Shop 🛍️

A modern, full-stack e-commerce platform built with **Next.js 16**, **React 19**, **Supabase**, and **Tailwind CSS v4**. Features a complete admin dashboard for product and inventory management with role-based access control.

🔗 **Live Demo:** [hexashop.foysal.me](https://hexashop.foysal.me)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?logo=supabase)

---

## ✨ Features

### 🛒 Storefront

- **Product Catalog** — Browse products by categories with advanced filtering
- **Responsive Design** — Mobile-first UI that works seamlessly across all devices
- **Dark/Light Mode** — Theme switching with system preference detection
- **Optimized Images** — Next.js Image component with blur placeholders for fast loading

### 🔐 Authentication

- **Email/Password Login** — Traditional authentication with password reset flow
- **Google OAuth** — One-click social login integration
- **Session Management** — Secure cookie-based sessions via Supabase SSR

### 📊 Admin Dashboard

- **Product Management** — Create, update, and delete products with rich text descriptions (TipTap editor)
- **Category Management** — Hierarchical categories with parent-child relationships
- **Image Upload** — Multi-image upload to Supabase Storage with automatic optimization
- **Inventory Tracking** — Stock management with variant support (size, color, etc.)
- **Order Management** — View and process customer orders
- **Analytics** — Dashboard with key business metrics

### 🛡️ Role-Based Access Control

- **Admin** — Full access to all features including delete operations
- **Demo Admin** — Read, create, and update access (no delete) for showcasing
- **Middleware Protection** — Server-side route protection for `/admin/*` paths

---

## 🏗️ Tech Stack

| Layer                | Technology                                  |
| -------------------- | ------------------------------------------- |
| **Framework**        | Next.js 16 (App Router)                     |
| **UI Library**       | React 19                                    |
| **Language**         | TypeScript 5.x                              |
| **Styling**          | Tailwind CSS v4, shadcn/ui (new-york style) |
| **Database**         | Supabase (PostgreSQL)                       |
| **Authentication**   | Supabase Auth (Email + OAuth)               |
| **File Storage**     | Supabase Storage                            |
| **State Management** | TanStack Query v5 (React Query)             |
| **Forms**            | React Hook Form + Zod validation            |
| **Rich Text**        | TipTap Editor                               |
| **Icons**            | Lucide React                                |
| **Notifications**    | Sonner (Toast)                              |

---

## 📁 Project Structure

```
app/
├── (root)/              # Public storefront (route group, invisible in URL)
│   └── products/        # Product listing and detail pages
├── admin/               # Protected admin dashboard
│   ├── products/        # Product CRUD, categories, inventory
│   ├── orders/          # Order management
│   ├── customers/       # Customer management
│   ├── analytics/       # Business analytics
│   └── settings/        # Store settings, shipping, discounts
├── auth/                # Authentication flows
│   ├── callback/        # OAuth callback handler
│   ├── confirm/         # Email confirmation
│   └── forgot-password/ # Password reset
└── actions/             # Server actions

components/
├── ui/                  # shadcn/ui primitives (Button, Card, Dialog, etc.)
├── admin/               # Admin-specific components
│   ├── sidebar/         # Collapsible navigation sidebar
│   ├── products/        # Product form, table, cards
│   └── categories/      # Category CRUD components
├── auth/                # Login, signup, password forms
└── home/                # Storefront components (hero, navbar)

lib/
├── services/            # Server Actions with "use server" directive
│   ├── products.ts      # Product CRUD operations
│   └── categories.ts    # Category CRUD operations
├── supabase/            # Supabase client factories
│   ├── server.ts        # SSR client (cookies-based)
│   ├── client.ts        # Browser client
│   └── supabase-admin.ts# Service role client for admin ops
└── auth/
    └── roles.ts         # Role checking utilities

hooks/
├── use-products.ts      # TanStack Query hooks for products
└── use-categories.ts    # TanStack Query hooks for categories

providers/
├── query-provider.tsx   # TanStack Query provider
└── user-provider.tsx    # Auth state context provider
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **pnpm** (recommended) or npm
- **Supabase Account** — [Create one here](https://supabase.com)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/hexa-shop.git
   cd hexa-shop
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**

   Run the SQL in `all.sql` in your Supabase SQL Editor to create tables:

   - `categories` — Product categories with hierarchy
   - `products` — Core product information
   - `products_variants` — Size, color, price variants
   - `product_images` — Product image gallery

5. **Create Supabase Storage buckets**

   - `category-images` — For category thumbnails
   - `product-images` — For product photos

   Set a 2MB file size limit on both buckets.

6. **Run the development server**

   ```bash
   pnpm dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

---

## 📜 Available Scripts

| Command      | Description                                |
| ------------ | ------------------------------------------ |
| `pnpm dev`   | Start development server at localhost:3000 |
| `pnpm build` | Create production build                    |
| `pnpm start` | Start production server                    |
| `pnpm lint`  | Run ESLint v9                              |

---

## 🔑 Key Implementation Details

### Supabase Client Pattern

The project follows Supabase's recommended pattern for Next.js 16 with Fluid compute—**never caching clients at module level**:

```typescript
// Server Components & Server Actions
const supabase = await createClient(); // Fresh instance per call

// Client Components
const supabase = createClient();
```

### Server Actions Architecture

All data mutations use Next.js Server Actions located in `lib/services/`:

```typescript
"use server";

export async function addProduct(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  // Validate, upload images, insert to DB
  revalidatePath("/admin/products");
  return { ok: true };
}
```

### TanStack Query Integration

Client-side data fetching uses TanStack Query for caching, optimistic updates, and automatic refetching:

```typescript
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const result = await getProducts();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
}
```

### Form Handling

Forms use React Hook Form with Zod schemas for type-safe validation:

```typescript
const { control, handleSubmit } = useForm<ProductFormData>({
  resolver: zodResolver(productFormSchema),
  defaultValues: defaultProductFormValues,
});
```

---

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com) (new-york style) — a collection of beautifully designed, accessible components:

- All components support dark mode via CSS variables
- Use `cn()` utility for className merging
- Add new components: `pnpm dlx shadcn@latest add <component>`

---

## 🔒 Security

- **Row Level Security (RLS)** — Supabase policies protect data access
- **Middleware Protection** — Admin routes checked server-side before rendering
- **Role Verification** — Server Actions verify user roles before mutations
- **Service Role Isolation** — Admin-only operations use dedicated service role client

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) — The React Framework
- [Supabase](https://supabase.com) — Open Source Firebase Alternative
- [shadcn/ui](https://ui.shadcn.com) — Beautiful UI Components
- [TanStack Query](https://tanstack.com/query) — Powerful Data Synchronization
- [Tailwind CSS](https://tailwindcss.com) — Utility-First CSS Framework
