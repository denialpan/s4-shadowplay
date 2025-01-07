import { Table, TableCaption, TableHeader, TableRow, TableHead, TableCell, TableBody } from "../ui/table"
import { MoreHorizontal, MoveLeft } from "lucide-react"
import { useState, useEffect } from 'react';
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/router";
import axios from 'axios'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

const DernTable = ({ data: initialData, fetchFiles }) => {

    const [data, setData] = useState(initialData);
    const [sortConfig, setSortConfig] = useState({ property: null, order: "asc" });
    const [selectedRows, setSelectedRows] = useState([]);
    const [draggedRows, setDraggedRows] = useState([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
    const router = useRouter();

    // Sync data state with initialData prop
    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Handle row selection
    const toggleRowSelection = (index, e) => {
        if (e.shiftKey && lastSelectedIndex !== null) {
            // Select a range of rows when Shift is pressed
            const [start, end] = [lastSelectedIndex, index].sort((a, b) => a - b);
            const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

            setSelectedRows((prevSelected) => {
                const newSelected = new Set(prevSelected);
                range.forEach((i) => newSelected.add(i));
                return Array.from(newSelected);
            });
        } else if (e.ctrlKey && lastSelectedIndex !== null) {
            // Toggle selection for a single row
            setSelectedRows((prevSelected) =>
                prevSelected.includes(index)
                    ? prevSelected.filter((i) => i !== index) // Deselect row
                    : [...prevSelected, index] // Select row
            );
        } else {
            setSelectedRows([index]);
        }
        // Update the last selected index
        setLastSelectedIndex(index);
    };

    const sortData = (property) => {
        // Determine the new sort order
        const newOrder =
            sortConfig.property === property && sortConfig.order === "asc" ? "desc" : "asc";

        // Sort a copy of the data
        const sortedData = [...data].sort((a, b) => {
            // Prioritize RowType === "Folder"
            if (a.RowType === "Folder" && b.RowType !== "Folder") return -1;
            if (b.RowType === "Folder" && a.RowType !== "Folder") return 1;

            // Sort by the property in the determined order
            if (a[property] < b[property]) return newOrder === "asc" ? -1 : 1;
            if (a[property] > b[property]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        // Update state with the sorted data and new configuration
        setData(sortedData);
        setSortConfig({ property, order: newOrder });
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

    const handleDragStart = (row) => {
        const selectedFileRows = selectedRows.length
            ? selectedRows.map((rowIndex) => data[rowIndex]) // Get data for selected rows
            : [row]; // If no rows are selected, drag the current row

        setDraggedRows(selectedFileRows);
        console.log("Dragging files:", selectedFileRows);
    };

    const handleDropOnFolder = async (folderRow) => {

        if (draggedRows.length > 0 && folderRow.RowType === "Folder") {

            const folders = draggedRows.filter((row) => row.RowType === "Folder");
            const files = draggedRows.filter((row) => row.RowType === "File");

            await axios.post('/api/file/move', {
                files: files,
                folders: folders,
                targetFolder: folderRow.Id,
            })

            fetchFiles();
        }
        setDraggedRows([]);
        setSelectedRows([]);
    };

    const handleDelete = async (row) => {

        const selectedFileRows = selectedRows.length ? selectedRows.map((rowIndex) => data[rowIndex]) : [row];
        const deleteFiles = selectedFileRows.filter((r) => r.RowType === "File");
        const deleteFolders = selectedFileRows.filter((r) => r.RowType === "Folder");

        // if is single selection
        // if is multi selection

        console.log(deleteFiles);
        console.log(deleteFolders);

        await axios.delete('/api/file/delete', {
            data: {
                files: deleteFiles,
                folders: deleteFolders,
            }
        })

        fetchFiles();
        setSelectedRows([]);
    };

    return (
        <Table>

            <TableCaption>DREW PACK.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>
                        <Checkbox
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            onCheckedChange={() => {
                                if (selectedRows.length === data.length) {
                                    setSelectedRows([]);
                                } else {
                                    setSelectedRows(data.map((_, index) => index));
                                }
                            }}
                            checked={selectedRows.length === data.length && data.length > 0}
                        />
                    </TableHead>
                    <TableHead onClick={() => { sortData('Name'); setSelectedRows([]); }}>Name</TableHead>
                    <TableHead onClick={() => { sortData('Modified'); setSelectedRows([]); }}>Last Modified</TableHead>
                    <TableHead onClick={() => { sortData('Size'); setSelectedRows([]); }}>Size</TableHead>
                    <TableHead onClick={() => { sortData('Owner'); setSelectedRows([]); }}>Owner</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>

                <TableRow onDoubleClick={() => {
                    const regex = /folder\/[^/]+$/;
                    if (regex.test(router.asPath)) {
                        router.push('/')
                    } else {
                        router.push(router.asPath.substring(0, router.asPath.lastIndexOf('/')))
                    }
                }}
                    key="previous"
                    className={`hover:bg-zinc-400`} // Highlight selected row
                >
                    <TableCell className="max-w-1">
                        <MoveLeft size="16" />
                    </TableCell>
                    <TableCell className="max-w-1">
                        ..
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>

                </TableRow>

                {data.map((row, index) => (
                    <ContextMenu key={index} modal={false}>
                        <ContextMenuTrigger asChild>
                            <TableRow
                                key={row.Id}
                                data-index={index}
                                draggable={row.RowType === "File" || row.RowType === "Folder"} // Only files are draggable
                                onDragStart={() => handleDragStart(row)}
                                onDrop={row.RowType === "Folder" ? () => handleDropOnFolder(row) : undefined}
                                onDragOver={(event) => {
                                    row.RowType === "Folder" &&
                                        !draggedRows.some((draggedRow) => draggedRow.Id === row.Id)
                                        ? event.preventDefault()
                                        : undefined
                                }

                                }
                                onClick={(event) => { toggleRowSelection(index, event) }}
                                onDoubleClick={() => {
                                    if (row.RowType === "Folder") {

                                        if (row.Parent === 'root') {
                                            router.push(`/folder/${row.Name}`);
                                        } else {
                                            router.push(`${router.asPath}/${row.Name}`);
                                        }
                                    }
                                }}
                                className={`hover:bg-zinc-400 ${selectedRows.includes(index) ? "bg-zinc-300 dark:bg-zinc-600" : ""
                                    }`} // Highlight selected row
                            >
                                <TableCell className="max-w-1">
                                    <Checkbox
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                        onCheckedChange={() => {
                                            if (selectedRows.includes(index)) {
                                                setSelectedRows((prev) =>
                                                    prev.filter((i) => i !== index)
                                                );
                                            } else {
                                                setSelectedRows((prev) => [...prev, index]);
                                            }
                                        }}
                                        checked={selectedRows.includes(index)} />
                                </TableCell>
                                <TableCell>{row.Name}</TableCell>
                                <TableCell>{formatFileDate(row.Modified)}</TableCell>
                                <TableCell>
                                    {row.RowType === "Folder"
                                        ? row.Size
                                        : formatFileSize(row.Size)}
                                </TableCell>
                                <TableCell>{row.Owner}</TableCell>
                                <TableCell>
                                    <MoreHorizontal size="16" />
                                </TableCell>
                            </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onClick={() => { handleDelete(row) }}>Delete</ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem>Edit</ContextMenuItem>
                        </ContextMenuContent>

                    </ContextMenu>

                ))}
            </TableBody>
        </Table >

    )
}

export default DernTable;