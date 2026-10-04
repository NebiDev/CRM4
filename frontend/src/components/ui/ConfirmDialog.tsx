import { Modal } from "./Modal";
import { Button } from "./Button";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    destructive?: boolean;
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    destructive,
    loading,
}: Props) {
    return (
        <Modal open={open} onClose={onClose} title={title} description={description}>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant={destructive ? "destructive" : "primary"}
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? "Working…" : confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}