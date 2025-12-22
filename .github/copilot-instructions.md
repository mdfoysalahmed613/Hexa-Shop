# Copilot Instructions for Hexa Shop

Next.js 16 e-commerce app with Supabase auth, React 19, Tailwind CSS v4, and Radix UI.

## Quick Reference

```bash
pnpm dev      # Dev server at localhost:3000
pnpm build    # Production build
pnpm lint     # ESLint v9
```

Always use `pnpm`, not npm or yarn.

## Architecture

### Supabase Client Pattern (Critical)

**Never cache Supabase client at module level** — create fresh instances per function call:

```typescript
// Server Components & Route Handlers (lib/supabase/server.ts)
const supabase = await createClient();

// Client Components (lib/supabase/client.ts)
const supabase = createClient();
```

### Client/Server Boundary

| Use Case                    | Directive      | Supabase Import         |
| --------------------------- | -------------- | ----------------------- |
| Data fetching, auth checks  | None (Server)  | `@/lib/supabase/server` |
| Forms, interactivity, hooks | `"use client"` | `@/lib/supabase/client` |

### User Context

- `useUser()` hook from `@/providers/user-provider` — Client Components only
- Auto-subscribes to auth state changes
- Call `refreshUser()` after role/metadata updates

### Role-Based Access

```typescript
import { isAdmin, isDemoAdmin, hasAdminAccess } from "@/lib/auth/roles";
// Reads from user.app_metadata.role
```

## File Organization

```
app/
  (root)/          # Public pages (invisible in URL)
  admin/           # Protected admin dashboard
  auth/            # Login, signup, OAuth callback
  actions/         # Server Actions (add-category.ts, add-product.ts)
components/
  ui/              # Radix + CVA primitives (Button, Input, Field, etc.)
  admin/           # Admin-specific (sidebar, forms, lists)
  auth/            # Auth forms (login-form.tsx, sign-up-form.tsx)
lib/
  supabase/        # server.ts, client.ts, proxy.ts
  auth/roles.ts    # isAdmin(), hasAdminAccess()
```

## UI Patterns

### Forms with react-hook-form + Zod

```typescript
// 1. Define schema (e.g., components/admin/categories/category-form-schema.ts)
export const categoryFormSchema = z.object({
  name: z.string().min(1, "Required"),
  is_active: z.boolean(),
});

// 2. Use Field components for consistent layout
<Field data-invalid={!!fieldState.error}>
  <FieldLabel>Name</FieldLabel>
  <Input {...field} />
  {fieldState.error && (
    <FieldError errors={[{ message: fieldState.error.message }]} />
  )}
</Field>;
```

### Server Actions

```typescript
// app/actions/add-category.ts
"use server";
export async function addCategory(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  // ... validation and DB operations
  revalidatePath("/admin/products/categories");
  return { ok: true };
}
```

### UI Components

- Import from `@/components/ui/` — all support dark mode
- Use `cn()` from `@/lib/utils` for className merging
- Icons: `lucide-react`
- Toasts: `import { toast } from "sonner"`

## Critical Gotchas

1. **Supabase server client**: Always `await createClient()` inside functions, never at module scope
2. **`useUser()` hook**: Only works in Client Components — will throw in Server Components
3. **Route groups**: `(root)` and `(auth)` folders don't appear in URLs
4. **Session refresh**: Handled automatically by middleware (`proxy.ts`) — no manual sync needed
5. **Path aliases**: Always use `@/` imports (maps to project root)

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
