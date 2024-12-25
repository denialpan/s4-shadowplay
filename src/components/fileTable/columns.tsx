// @ts-nocheck - React 18 broke syntax and displays errors for this, but shadcn code still works
// will maybe look into fixing it one day
"use client"

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



import axios from 'axios';


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

const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatFileDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
};

export type IndividualFile = {
    Key: string
    LastModified: string
    Size: number
    Owner: "Nobody so far"
}

export const columns = (fetchFiles): ColumnDef<IndividualFile>[] => {

    return [
        {
            accessorKey: "Key",
            header: ({ column }) => {
                return (
                    <div className="hover:cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Name
                    </div>
                )
            },
            cell: ({ row }) => {
                return <div className="text-left font-medium">{row.getValue("Key")}</div>
            },
        },
        {
            accessorKey: "LastModified",
            header: ({ column }) => {
                return (
                    <div className="hover:cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Last Modified
                    </div>
                )
            },
            cell: ({ row }) => {
                return <div className="text-left font-medium">{formatFileDate(row.getValue("LastModified"))}</div>
            },
        },
        {
            accessorKey: "Size",
            header: ({ column }) => {
                return (
                    <div className="hover:cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Size
                    </div>
                )
            },
            cell: ({ row }) => {
                return <div className="text-left font-medium">{formatFileSize(row.getValue("Size"))}</div>
            },
        },
        {
            accessorKey: "Owner",
            header: ({ column }) => {
                return (
                    <div className="hover:cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Owner
                    </div>
                )
            },
            cell: ({ row }) => {
                return <div className="text-left font-medium">Me</div>
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const file = row.original;
                console.log(file);

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                            <DropdownMenuItem
                                onClick={() => handleDelete(file.Key, fetchFiles)}
                            >
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

}