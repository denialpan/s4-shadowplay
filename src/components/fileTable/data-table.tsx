// @ts-nocheck - React 18 broke syntax and displays errors for this, but shadcn code still works
// will maybe look into fixing it one day
"use client"

import * as React from 'react'
import axios from 'axios'
import { MoreHorizontal } from "lucide-react"
import {
    ColumnDef,
    SortingState,
    flexRender,
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


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    fetchFiles: () => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    fetchFiles,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    // handle file deletion
    const handleDelete = async (fileKey, fetchFiles) => {
        try {
            const response = await axios.delete('/api/file/delete', {
                data: { fileKey },  // file key in request body
            });

            if (response.status === 200) {
                console.log(`File ${fileKey} deleted successfully`);
                console.log("YEAH THIS IS BEING CALLED THROUGH PASSED IN FUNCTIOn")
                fetchFiles();
            }
        } catch (error) {
            console.error(`Error deleting file ${fileKey}:`, error);
        }
    };

    return (
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
                            <ContextMenu key={row.id}>
                                <ContextMenuTrigger asChild>
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleDelete(row.original.Key, fetchFiles)}>Delete</ContextMenuItem>
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
    )
}
