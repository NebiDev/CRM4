import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useUploadFile } from "./hooks";

interface Props {
    clientId?: string;
    projectId?: string;
    invoiceId?: string;
    visibility?: "ORG" | "CLIENT";
    label?: string;
}

export function UploadButton({
    clientId,
    projectId,
    invoiceId,
    visibility = "ORG",
    label = "Upload file",
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const upload = useUploadFile();
    const [busy, setBusy] = useState(false);

    const pick = () => inputRef.current?.click();

    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBusy(true);
        try {
            await upload.mutateAsync({ file, clientId, projectId, invoiceId, visibility });
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <>
            <input ref={inputRef} type="file" hidden onChange={onChange} />
            <Button onClick={pick} disabled={busy}>
                {busy ? <Spinner /> : <Upload className="h-4 w-4" />} {label}
            </Button>
        </>
    );
}