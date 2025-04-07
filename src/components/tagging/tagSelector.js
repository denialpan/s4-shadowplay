import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

export default function TagSelector({ fileId, onTagsUpdated }) {
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        async function fetchTags() {
            try {
                // Fetch all available tags
                const allTagsRes = await axios.get("/api/tag/list");
                setTags(allTagsRes.data.tags);

                // Fetch tags already assigned to the file
                const assignedTagsRes = await axios.get(`/api/tag/get?fileId=${fileId}`);
                setSelectedTags(assignedTagsRes.data.tags);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        }

        fetchTags();
    }, [fileId]);

    const handleChange = async (selectedOptions) => {
        const removedTags = selectedTags.filter(tag => !selectedOptions.some(t => t.value === tag.value));
        setSelectedTags(selectedOptions);

        // Remove unselected tags from the database
        for (const removedTag of removedTags) {
            try {
                await axios.delete("/api/tag/remove", { data: { fileId, tagId: removedTag.value } });
            } catch (error) {
                console.error("Error removing tag:", error);
            }
        }

        // Add new tags if needed
        const newTags = selectedOptions.filter(tag => !tags.some(t => t.value === tag.value));
        const createdTagIds = [];

        for (const newTag of newTags) {
            try {
                const response = await axios.post("/api/tag/create", { name: newTag.label });
                const createdTag = response.data;

                // Store the new tag ID to use in assignment
                createdTagIds.push(createdTag.id);

                // Add to the tag list
                setTags(prevTags => [...prevTags, { value: createdTag.id, label: createdTag.name }]);
            } catch (error) {
                console.error("Error creating tag:", error);
            }
        }

        // ✅ Prevent API call if no tags are selected
        if (selectedOptions.length > 0) {
            try {
                // Get final tag IDs for assignment (existing + newly created)
                const finalTagIds = selectedOptions.map(tag => tag.value).concat(createdTagIds);

                await axios.post("/api/tag/assign", {
                    fileId,
                    tags: finalTagIds,
                });

                if (onTagsUpdated) onTagsUpdated(selectedOptions);
            } catch (error) {
                console.error("Error assigning tags:", error);
            }
        } else {
            console.log("No tags left, skipping assignment API call.");
        }
    };

    return (
        <CreatableSelect
            isMulti
            options={tags}
            value={selectedTags}
            onChange={handleChange}
            placeholder="Select or create a tag..."
            isClearable
            isSearchable
            noOptionsMessage={() => "Type to create a new tag"}
            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
        />
    );
}
