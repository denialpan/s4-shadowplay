import axios from "axios";
import { useRouter } from "next/router";
import { Moon, MoonIcon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { SlidersHorizontal } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import TagFilterSelector from "./tagging/tagSelectorFilter";

const Header = () => {

    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState({
        name: "",
        minSize: "",
        maxSize: "",
        type: "",
        owner: "",
        startDate: "",
        endDate: "",
        tags: [],
    });

    const handleSearch = async () => {
        const tagValues = filters.tags.map(t => t.label);

        const searchParams = new URLSearchParams({
            query: query || "",
            ...filters,
            tags: tagValues.join(",") // will be "" if empty
        }).toString();

        router.push(`/search?${searchParams}`);

    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex justify-between items-center p-4 gap-2">
            {router.pathname !== "/login" && <SidebarTrigger />}

            {router.pathname !== "/login" && (
                <div className="relative w-full max-w-md">

                    <Input
                        className="pr-12 fifty-max-width text-sm"
                        placeholder="Search files..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />

                    <Popover>
                        <PopoverTrigger asChild>
                            <SlidersHorizontal className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4">
                            <h3 className="text-sm font-semibold mb-2">Filter</h3>

                            <Label className="text-sm">File Size (KB)</Label>
                            <div className="flex space-x-2 mb-2">
                                <Input name="minSize" value={filters.minSize} onChange={handleFilterChange} placeholder="Min" className="w-1/2 text-sm" />
                                <Input name="maxSize" value={filters.maxSize} onChange={handleFilterChange} placeholder="Max" className="w-1/2 text-sm" />
                            </div>

                            <Label className="text-sm">Type</Label>
                            <Select className="text-sm" name="type" value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                                <SelectTrigger>
                                    <SelectValue className="text-sm" placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="text-sm">
                                    <SelectItem className="text-sm" value="audio">Audio</SelectItem>
                                    <SelectItem className="text-sm" value="video">Video</SelectItem>
                                    <SelectItem className="text-sm" value="image">Image</SelectItem>
                                    <SelectItem className="text-sm" value="document">Document</SelectItem>
                                    <SelectItem className="text-sm" value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>

                            <Label className="text-sm">Owner</Label>
                            <Input name="owner" value={filters.owner} onChange={handleFilterChange} placeholder="Enter owner name" className="mb-2 text-sm" />

                            <Label className="text-sm">Created At</Label>
                            <div className="flex space-x-2 mb-2">
                                <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-1/2 text-sm" />
                                <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-1/2 text-sm" />
                            </div>

                            <Label className="text-sm mt-2">Tags</Label>
                            <TagFilterSelector
                                selected={filters.tags}
                                onChange={(tags) => setFilters(prev => ({ ...prev, tags }))}
                            />

                            <Button className="w-full mt-2" onClick={handleSearch}>
                                Apply Filters
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            )}


            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        Dark
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

}

export default Header;