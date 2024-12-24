"use client"

import { ColumnDef } from '@tanstack/react-table'

export type IndividualFile = {
    Key: string
    LastModified: string
    Size: number
    Owner: "Nobody so far"
}

export const columns: ColumnDef<IndividualFile>[] = [
    {
        accessorKey: "Key",
        header: "Name",
    },
    {
        accessorKey: "LastModified",
        header: "Last Modified",
    },
    {
        accessorKey: "Size",
        header: "Size",
    },
    {
        accessorKey: "Owner",
        header: "Owner",
    },
]