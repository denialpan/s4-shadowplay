import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

export default function TagFilterSelector({ onChange, selected = [] }) {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        async function fetchTags() {
            try {
                const res = await axios.get("/api/tag/list");
                setTags(res.data.tags);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
            }
        }

        fetchTags();
    }, []);

    const handleChange = (selectedOptions) => {
        onChange(selectedOptions || []);
    };

    return (
        <CreatableSelect
            isMulti
            options={tags}
            value={selected}
            onChange={handleChange}
            placeholder="Filter by tags..."
            isClearable
            isSearchable
            noOptionsMessage={() => "Type to create a new tag"}
            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
        />
    );
}
