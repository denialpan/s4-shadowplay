import { Table, TableCaption, TableHeader, TableRow, TableHead, TableCell, TableBody } from "../ui/table"
import { Folder, MoreHorizontal, MoveLeft } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Badge } from "../ui/badge";

import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import FolderTree from "../folderHierharchy/folderTree";
import TagSelector from "../tagging/tagSelector";
import clsx from "clsx";

const DernTable = ({ data: initialData, triggerRefresh, path, currentDirectoryId }) => {

    const [data, setData] = useState(initialData);
    const [sortConfig, setSortConfig] = useState({ property: null, order: "asc" });
    const [selectedRows, setSelectedRows] = useState([]);
    const [draggedRows, setDraggedRows] = useState([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

    const [dialogType, setDialogType] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const [selectedFolderMoveId, setSelectedFolderMoveId] = useState(null);

    const router = useRouter();

    const onSubmitNewFolder = async (event) => {

        event.preventDefault();

        const formData = new FormData(event.target);
        const folderName = formData.get("folderName").trim();
        const validFolderNameRegex = /^[a-zA-Z0-9-_,.()[\]{}&@!^%+=~]+( [a-zA-Z0-9-_,.()[\]{}&@!^%+=~]+)*$/;

        if (!folderName) {
            alert("Folder name cannot be empty.");
            return;
        }

        if (!validFolderNameRegex.test(folderName)) {
            alert("Folder name cannot contain: \\ / : * ? \" < > |");
            return;
        }

        console.log(folderName);
        console.log("NEW FOLDER " + router.asPath);
        let folderPath = "";
        if (path) {
            folderPath = Array.isArray(path) ? path.join("/") : "";
        }

        await axios.post(`/api/file/folder`, {
            folderPath: folderPath,
            newFolderName: folderName,
        });
        triggerRefresh();
        setSelectedRows([]);
    }

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

            triggerRefresh();
        }
        setDraggedRows([]);
        setSelectedRows([]);
    };

    const handleManualMove = async (row) => {
        // fake dragging rows
        const selectedFileRows = selectedRows.length
            ? selectedRows.map((rowIndex) => data[rowIndex]) // Get data for selected rows
            : [row]; // If no rows are selected, drag the current row


        if (selectedFileRows.length > 0) {

            console.log(selectedFolderMoveId);

            const folders = selectedFileRows.filter((row) => row.RowType === "Folder");
            const files = selectedFileRows.filter((row) => row.RowType === "File");

            // cannot pass folder into itself infinite black hole
            if (folders.some(folder => folder.Id === selectedFolderMoveId)) {
                alert("Error: A folder cannot be moved into itself!");
                return;
            }

            await axios.post('/api/file/move', {
                files: files,
                folders: folders,
                targetFolder: selectedFolderMoveId,
            })

            triggerRefresh();
            setSelectedFolderMoveId(null);
        }
        setDraggedRows([]);
        setSelectedRows([]);
    };

    const handleDelete = async (row) => {

        const selectedFileRows = selectedRows.length ? selectedRows.map((rowIndex) => data[rowIndex]) : [row];
        const deleteFiles = selectedFileRows.filter((r) => r.RowType === "File");
        const deleteFolders = selectedFileRows.filter((r) => r.RowType === "Folder");

        console.log(deleteFiles);
        console.log(deleteFolders);

        await axios.delete('/api/file/delete', {
            data: {
                files: deleteFiles,
                folders: deleteFolders,
            }
        })

        triggerRefresh();
        setSelectedRows([]);
    };

    const handleTemporaryShare = async (row) => {
        const res = await axios.get("/api/file/preview", { params: { key: row.S3Key } });
        await navigator.clipboard.writeText(res.data.url);
    }

    return (

        <ScrollArea className="h-[calc(100vh-220px)] w-full">
            <Table>
                {/* <TableCaption>s4-shadowplay</TableCaption> */}
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
                        <TableHead onClick={() => { sortData('Tags'); setSelectedRows([]); }}>Tags</TableHead>
                        <TableHead onClick={() => { sortData('Owner'); setSelectedRows([]); }}>Owner</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <ContextMenu key="cd .." modal={false}>
                        <ContextMenuTrigger asChild>
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
                                    -
                                </TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>

                            </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onClick={() => { setDialogType("New Folder"); setDialogOpen(true); }}>New Folder</ContextMenuItem>
                        </ContextMenuContent>

                    </ContextMenu>

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
                                    onDoubleClick={async () => {
                                        if (row.RowType === "Folder") {

                                            if (row.Parent === 'root') {
                                                router.push(`/folder/${row.Name}`);
                                            } else {
                                                router.push(`${router.asPath}/${row.Name}`);
                                            }
                                        } else if (row.RowType === "File") {
                                            const streamUrl = `/api/file/stream?key=${encodeURIComponent(row.S3Key)}`;

                                            setPreviewUrl(streamUrl);
                                            setPreviewFile(row);
                                            setDialogType("Preview");
                                            setDialogOpen(true);
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
                                    <TableCell>
                                        {row.Tags && row.Tags.length > 0 ? (
                                            row.Tags.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">No tags</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{row.Owner}</TableCell>

                                </TableRow>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => { setDialogType("New Folder"); setDialogOpen(true); }}>New Folder</ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => { setDialogType("Move"); setDialogOpen(true); }}>Move</ContextMenuItem>
                                <ContextMenuItem onClick={() => { setDialogType("Edit Tag"); setDialogOpen(true); }}>Edit Tag</ContextMenuItem>
                                <ContextMenuItem onClick={() => { handleTemporaryShare(row) }}>Share</ContextMenuItem>
                                <ContextMenuItem onClick={() => { handleDelete(row) }}>Delete</ContextMenuItem>
                            </ContextMenuContent>

                        </ContextMenu>

                    ))}

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent
                            className={clsx(
                                "flex flex-col ninety-max-height",
                                {
                                    "sm:max-w-[450px]": dialogType === "New Folder",
                                    "sm:max-w-[450px] sm:max-h-[500px]": dialogType === "Move",
                                    "sm:max-w-[75vw]": dialogType === "Preview",
                                }
                            )}
                        >

                            <DialogTitle>{dialogType}</DialogTitle>

                            {dialogType === "New Folder" && (
                                <form onSubmit={onSubmitNewFolder}>
                                    <div className="flex space-x-3">
                                        <Input name="folderName" placeholder="Folder name" />
                                        <DialogClose asChild>
                                            <Button className="w-16" type="submit">Create</Button>
                                        </DialogClose>
                                    </div>
                                </form>
                            )}

                            {dialogType === "Move" && (
                                <div className="border p-2 overflow-y-auto">
                                    <FolderTree
                                        redirect={false}
                                        onSelect={setSelectedFolderMoveId}
                                        selectedNode={selectedFolderMoveId}
                                        currentDirectoryId={currentDirectoryId}
                                    />
                                </div>
                            )}

                            {dialogType === "Preview" && previewFile && previewUrl && (
                                <div className="mt-4 flex justify-center items-center max-h-[90vh] max-w-[90vw] overflow-hidden">
                                    {(() => {
                                        const cleanedExtension = previewFile.file_extension?.replace(/^\./, '') || '';
                                        const mimeType = cleanedExtension ? `${previewFile.Type}/${cleanedExtension}` : undefined;

                                        if (previewFile.Type === "video") {
                                            return (
                                                <video controls autoPlay className="w-full h-auto max-h-[90vh] max-w-[90vw]">
                                                    <source src={`/api/file/stream?key=${encodeURIComponent(previewFile.S3Key)}`} />
                                                    Your browser does not support the video tag.
                                                </video>
                                            );
                                        }

                                        if (previewFile.Type === "audio") {
                                            return (
                                                <audio controls autoPlay className="w-full mt-2">
                                                    <source src={previewUrl} type={mimeType} />
                                                    Your browser does not support the audio tag.
                                                </audio>
                                            );
                                        }

                                        if (previewFile.Type === "image") {
                                            return (
                                                <img
                                                    src={previewUrl}
                                                    alt={previewFile.Name}
                                                    className="max-w-full max-h-[60vh] rounded"
                                                />
                                            );
                                        }

                                        return (
                                            <p className="text-sm italic text-muted-foreground">
                                                Preview not available for this file type.
                                            </p>
                                        );
                                    })()}
                                </div>
                            )}



                            {dialogType === "Add Tag" && previewFile && (
                                <TagSelector fileId={previewFile.Id} onTagsUpdated={(tags) => console.log("Updated Tags:", tags)} />
                            )}

                            <DialogFooter>
                                {dialogType === "Move" && (
                                    <DialogClose asChild>
                                        <Button
                                            disabled={!selectedFolderMoveId}
                                            className="w-32"
                                            onClick={() => handleManualMove(previewFile)}
                                        >
                                            Confirm Move
                                        </Button>
                                    </DialogClose>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </TableBody>
            </Table >
            <ScrollBar orientation="horizontal" />
        </ScrollArea >


    )
}

export default DernTable;