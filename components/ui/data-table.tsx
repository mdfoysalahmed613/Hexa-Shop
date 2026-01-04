"use client";

import {
   ColumnDef,
   flexRender,
   getCoreRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   getFilteredRowModel,
   useReactTable,
   SortingState,
   ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
   ChevronLeft,
   ChevronRight,
   ChevronsLeft,
   ChevronsRight,
} from "lucide-react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
   columns: ColumnDef<TData, TValue>[];
   data: TData[];
   pageSize?: number;
}

export function DataTable<TData, TValue>({
   columns,
   data,
   pageSize = 10,
}: DataTableProps<TData, TValue>) {
   const [sorting, setSorting] = useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

   const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      state: {
         sorting,
         columnFilters,
      },
      initialState: {
         pagination: {
            pageSize,
         },
      },
   });

   return (
      <div className="space-y-4">
         <div className="rounded-md border">
            <Table>
               <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <TableHead key={header.id}>
                              {header.isPlaceholder
                                 ? null
                                 : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                 )}
                           </TableHead>
                        ))}
                     </TableRow>
                  ))}
               </TableHeader>
               <TableBody>
                  {table.getRowModel().rows?.length ? (
                     table.getRowModel().rows.map((row) => (
                        <TableRow
                           key={row.id}
                           data-state={row.getIsSelected() && "selected"}
                        >
                           {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                 {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                 )}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell
                           colSpan={columns.length}
                           className="h-24 text-center"
                        >
                           No results.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         {/* Pagination */}
         <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <span>
                  Showing{" "}
                  {table.getState().pagination.pageIndex *
                     table.getState().pagination.pageSize +
                     1}{" "}
                  to{" "}
                  {Math.min(
                     (table.getState().pagination.pageIndex + 1) *
                     table.getState().pagination.pageSize,
                     table.getFilteredRowModel().rows.length
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length} entries
               </span>
               <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={(value) => table.setPageSize(Number(value))}
               >
                  <SelectTrigger className="h-8 w-[70px]">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     {[10, 20, 30, 50, 100].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                           {size}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            <div className="flex items-center gap-2">
               <span className="text-sm text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
               </span>
               <div className="flex items-center gap-1">
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8"
                     onClick={() => table.setPageIndex(0)}
                     disabled={!table.getCanPreviousPage()}
                  >
                     <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8"
                     onClick={() => table.previousPage()}
                     disabled={!table.getCanPreviousPage()}
                  >
                     <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8"
                     onClick={() => table.nextPage()}
                     disabled={!table.getCanNextPage()}
                  >
                     <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8"
                     onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                     disabled={!table.getCanNextPage()}
                  >
                     <ChevronsRight className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}
