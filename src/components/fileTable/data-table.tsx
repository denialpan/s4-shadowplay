// @ts-nocheck - React 18 broke syntax and displays errors for this, but shadcn code still works
// will maybe look into fixing it one day
"use client"

import * as React from 'react'
import axios from 'axios'
import { MoreHorizontal } from "lucide-react"
import { Button } from '@/components/ui/button'
import {
    ColumnDef,
    SortingState,
    flexRender,
    VisibilityState,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRouter } from 'next/router'


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    fetchFiles: () => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    fetchFiles,
    onDragStart,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [rowSelection, setRowSelection] = React.useState({})
    const [lastSelectedRow, setLastSelectedRow] = React.useState<number | null>(null);
    const router = useRouter();

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            rowSelection,
            columnVisibility,
        },
    })

    const handleDragStart = (row) => {
        // Collect all selected files or just the dragged file
        const selectedFiles = Object.keys(rowSelection).length
            ? Object.keys(rowSelection).map((rowId) => table.getRow(rowId).original)
            : [row.original];

        onDragStart(selectedFiles);
    };

    // handle file deletion
    const handleDelete = async (row, fetchFiles) => {

        if (Object.keys(rowSelection).length < 2) {
            // single deletion
            try {
                const response = await axios.delete('/api/file/delete', {
                    data: { fileKey: row.original.Key },  // file key in request body
                });

                if (response.status === 200) {
                    console.log(`File ${row.original.Key} deleted successfully`);
                    fetchFiles();
                }
            } catch (error) {
                console.error(`Error deleting file ${fileKey}:`, error);
            }
        } else {
            // multi deletion deletion
            try {
                const selectedRows = Object.keys(rowSelection).map((rowId) => table.getRow(rowId).original.Key);

                const response = await axios.delete('/api/file/delete', {
                    data: { fileKeys: selectedRows },  // file key in request body
                });

                if (response.status === 200) {
                    console.log(`File ${selectedRows} deleted successfully`);
                    fetchFiles();
                }
            } catch (error) {
                console.error(`Error deleting files ${selectedRows}:`, error);
            }
        }

        table.resetRowSelection();
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        Columns
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {table
                        .getAllColumns()
                        .filter(
                            (column) => column.getCanHide()
                        )
                        .map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) =>
                                        column.toggleVisibility(!!value)
                                    }
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            )
                        })}
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <ContextMenu key={row.id} modal={false}>
                                    <ContextMenuTrigger asChild>
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected()}
                                            draggable={row.original.RowType === "File"} // Only files are draggable
                                            onDragStart={() => handleDragStart(row)}
                                            onDrop={row.original.RowType === "Folder" ? row.original.onDrop : undefined}
                                            onDragOver={row.original.RowType === "Folder" ? row.original.onDragOver : undefined}
                                            onClick={(event) => {
                                                if (event.shiftKey && lastSelectedRow !== null) {
                                                    // Shift + Click logic: Select range of rows
                                                    const start = Math.min(lastSelectedRow, row.index);
                                                    const end = Math.max(lastSelectedRow, row.index);

                                                    for (let i = start; i <= end; i++) {
                                                        table.getRowModel().rows[i].toggleSelected(true);
                                                    }
                                                } else if (event.ctrlKey || event.metaKey) {
                                                    // Ctrl + Click logic: Toggle selection for the clicked row
                                                    row.toggleSelected(!row.getIsSelected());
                                                } else {
                                                    // Regular click: Reset selection and select only the clicked row
                                                    table.resetRowSelection();
                                                    row.toggleSelected(!row.getIsSelected());
                                                    setLastSelectedRow(row.index);
                                                }

                                            }}
                                            onContextMenu={() => {
                                                table.resetRowSelection();
                                                row.toggleSelected(!row.getIsSelected());
                                                setLastSelectedRow(row.index);
                                            }}
                                            className={`bg-slate-50 dark:bg-neutral-900 ${row.original.RowType === "Folder" ? "cursor-pointer" : ""} desaturate select - none cursor - pointer ${row.getIsSelected() ? "bg-stone-400 dark:bg-stone-700" : ""
                                                } `}
                                            onDoubleClick={() => {
                                                if (row.original.RowType === "Folder") {
                                                    console.log(row.original);
                                                    console.log(router);
                                                    router.push(`${router.asPath}/${row.original.Key}`);
                                                }
                                            }}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="select-none p-0 pl-2">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                        <ContextMenuItem onClick={() => handleDelete(row, fetchFiles)}>Delete</ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem>Edit</ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                                // console.log(row.original)

                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>

    )
}
