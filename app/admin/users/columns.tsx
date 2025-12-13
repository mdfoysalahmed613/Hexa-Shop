"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
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

export const columns: ColumnDef<Profile>[] = [
   {
      accessorKey: "id",
      header: "ID",
   },
   {
      accessorKey: "email",
      header: "Email",
   },
   {
      accessorKey: "name",
      header: "Name",
   },
   {
      accessorKey: "role",
      header: "Role",
   },
   {
      accessorKey: "phone",
      header: "Phone",
   },
   {
      accessorKey: "gender",
      header: "Gender",
   },
   {
      accessorKey: "age",
      header: "Age",
   },
   {
      accessorKey: "created_at",
      header: "Created At",
   }
]