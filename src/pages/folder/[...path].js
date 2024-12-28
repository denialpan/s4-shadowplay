import AllFileInteraction from "@/components/AllFileInteraction";
import { useRouter } from "next/router";

export default function FolderPage() {

    const router = useRouter();
    const { path } = router.query;

    return (
        <AllFileInteraction path={path || []} />
    )
}
