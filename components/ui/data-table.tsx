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
   RowSelectionState,
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
   enableRowSelection?: boolean;
   onRowSelectionChange?: (selectedRows: TData[]) => void;
   bulkActionsToolbar?: React.ReactNode;
   searchBar?: React.ReactNode;
}

export function DataTable<TData, TValue>({
   columns,
   data,
   pageSize = 10,
   enableRowSelection = false,
   onRowSelectionChange,
   bulkActionsToolbar,
   searchBar,
}: DataTableProps<TData, TValue>) {
   const [sorting, setSorting] = useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

   const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onRowSelectionChange: (updater) => {
         const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
         setRowSelection(newSelection);
         if (onRowSelectionChange) {
            const selectedRows = Object.keys(newSelection)
               .filter(key => newSelection[key])
               .map(key => data[parseInt(key)]);
            onRowSelectionChange(selectedRows);
         }
      },
      enableRowSelection,
      state: {
         sorting,
         columnFilters,
         rowSelection,
      },
      initialState: {
         pagination: {
            pageSize,
         },
      },
   });

   const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;

   const totalRows = table.getFilteredRowModel().rows.length;

   return (
      <div className="space-y-4">
         {/* Search Bar and Page Size Selector Row */}
         {(searchBar || enableRowSelection) && (
            <div className="flex items-center justify-between gap-4">
               <div className="flex-1">
                  {searchBar}
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page</span>
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
            </div>
         )}
         {/* Bulk Actions Toolbar */}
         {enableRowSelection && selectedCount > 0 && bulkActionsToolbar && (
            <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
               <span className="text-sm font-medium">
                  {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
               </span>
               <div className="flex items-center gap-2">
                  {bulkActionsToolbar}
               </div>
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRowSelection({})}
                  className="ml-auto"
               >
                  Clear selection
               </Button>
            </div>
         )}
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
               {enableRowSelection ? (
                  <span>
                     {selectedCount} of {totalRows} row{totalRows !== 1 ? "s" : ""} selected
                  </span>
               ) : (
                  <span>
                     Showing{" "}
                     {table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                        1}{" "}
                     to{" "}
                     {Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                        totalRows
                     )}{" "}
                     of {totalRows} entries
                  </span>
               )}
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
