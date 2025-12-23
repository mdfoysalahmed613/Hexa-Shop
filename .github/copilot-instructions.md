# Copilot Instructions for Hexa Shop

Next.js 16 e-commerce app with Supabase auth, React 19, Tailwind CSS v4, and shadcn/ui (new-york style).

## Quick Reference

```bash
pnpm dev      # Dev server at localhost:3000
pnpm build    # Production build
pnpm lint     # ESLint v9
```

Always use `pnpm`. Add shadcn components via `pnpm dlx shadcn@latest add <component>`.

## Architecture

### Supabase Client Pattern (Critical)

**Never cache Supabase client at module level** — create fresh instances per function call:

```typescript
// Server Components, Route Handlers, Server Actions → lib/supabase/server.ts
const supabase = await createClient();

// Client Components → lib/supabase/client.ts
const supabase = createClient();

// Admin operations (role updates) → lib/supabase/supabase-admin.ts
import { adminAuthClient } from "@/lib/supabase/supabase-admin";
await adminAuthClient.updateUserById(userId, {
  app_metadata: { role: "admin" },
});
```

### Route Protection

Admin routes (`/admin/*`) are protected by middleware in [proxy.ts](proxy.ts) which calls [lib/supabase/proxy.ts](lib/supabase/proxy.ts). Uses `hasAdminAccess()` from [lib/auth/roles.ts](lib/auth/roles.ts) to check `user.app_metadata.role`.

### Client/Server Boundary

| Use Case                    | Directive      | Supabase Import         |
| --------------------------- | -------------- | ----------------------- |
| Data fetching, auth checks  | None (Server)  | `@/lib/supabase/server` |
| Forms, interactivity, hooks | `"use client"` | `@/lib/supabase/client` |

### User Context (Client Components Only)

```typescript
import { useUser } from "@/providers/user-provider";
const { user, isLoading, refreshUser } = useUser();
// Call refreshUser() after role/metadata updates to sync client state
```

## File Organization

```
app/
  (root)/              # Public storefront (route group, invisible in URL)
  admin/               # Protected dashboard (sidebar layout)
  auth/                # Login, signup, OAuth callback, password reset
lib/
  services/            # Server Actions with "use server" (categories.ts, products.ts)
  supabase/            # server.ts, client.ts, proxy.ts, supabase-admin.ts
  auth/roles.ts        # isAdmin(), isDemoAdmin(), hasAdminAccess()
components/
  ui/                  # shadcn/ui primitives (new-york style, CVA variants)
  admin/               # Admin-specific (sidebar/, categories/, products/)
  auth/                # Auth forms (login-form.tsx, sign-up-form.tsx)
```

## UI Patterns

### Forms: react-hook-form + Zod + Field Components

```typescript
// 1. Schema in dedicated file (e.g., components/admin/categories/category-form-schema.ts)
export const categoryFormSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  is_active: z.boolean(),
});

// 2. Form component uses Controller + Field layout
<Controller
  control={control}
  name="name"
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="name">
        Name <span className="text-red-500">*</span>
      </FieldLabel>
      <Input id="name" {...field} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>;
```

### Server Actions Pattern

Server Actions live in `lib/services/` with `"use server"` directive. Return `{ ok: boolean; error?: string }`:

```typescript
// lib/services/categories.ts
"use server";
export async function addCategory(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  // Validate, generate unique slug, upload to storage, insert to DB
  revalidatePath("/admin/products/categories");
  return { ok: true };
}
```

Image uploads use Supabase Storage buckets (`category-images`, `product-images`).

### UI Components

- Import from `@/components/ui/` — all support dark mode via CSS variables
- Use `cn()` from `@/lib/utils` for className merging
- Icons: `lucide-react`
- Toasts: `import { toast } from "sonner"`
- Rich text: TipTap editor in [components/ui/tiptap.tsx](components/ui/tiptap.tsx)

## Critical Gotchas

1. **Supabase server client**: Always `await createClient()` inside functions — Fluid compute requires fresh instances
2. **`useUser()` hook**: Throws if used outside `UserProvider` or in Server Components
3. **Route groups**: `(root)` folder doesn't appear in URLs — `/` not `/(root)/`
4. **Middleware**: Only runs on `/admin/*` paths (see `proxy.ts` matcher config)
5. **Path aliases**: Always use `@/` imports

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # For admin operations only
```

## TanStack Query Pattern

Use TanStack Query for all client-side data fetching. Hooks live in `hooks/` directory.

```typescript
// hooks/use-categories.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const CATEGORIES_QUERY_KEY = ["categories"] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const result = await getCategories();
      if (!result.ok) throw new Error(result.error);
      return result.data as Category[];
    },
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addCategory(formData);
      if (!result.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category created!");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Usage in components
const { data: categories, isLoading, error } = useCategories();
const addMutation = useAddCategory();
addMutation.mutate(formData);
```

## Supabase Storage Rules

- All image buckets (`category-images`, `product-images`) have a **2MB file size limit**
- Image column in database is named `image` (stores the public URL)
- When updating, pass existing image URL via form field if unchanged

## Admin-Only Operations (Role Check)

Server actions that modify data (add/update/delete) must verify `isAdmin()` role:

```typescript
// lib/services/categories.ts
import { isAdmin } from "@/lib/auth/roles";

export async function addCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdmin(user)) {
    return { ok: false, error: "Only admin users can perform this action" };
  }
  // ... proceed with operation
}
```

**Note:** `demo_admin` role has read-only access to admin panel but cannot modify data.

## Form Field Pattern with useWatch

Use `useWatch` for reactive field values instead of `watch()`:

```typescript
import { useForm, Controller, useWatch } from "react-hook-form";

const { control, handleSubmit, setValue } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

// Use useWatch for reactive values
const imageFile = useWatch({ control, name: "image" });
const currentImageUrl = useWatch({ control, name: "image_url" });
```
