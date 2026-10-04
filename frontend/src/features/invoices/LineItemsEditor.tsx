import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { InvoiceLineItem } from "./types";

interface Props {
    items: InvoiceLineItem[];
    onChange: (items: InvoiceLineItem[]) => void;
    disabled?: boolean;
}

export function LineItemsEditor({ items, onChange, disabled }: Props) {
    const update = (idx: number, patch: Partial<InvoiceLineItem>) => {
        const next = [...items];
        next[idx] = { ...next[idx], ...patch } as InvoiceLineItem;
        onChange(next);
    };

    const add = () => {
        onChange([
            ...items,
            { description: "", quantity: 1, unitPrice: 0, position: items.length },
        ]);
    };

    const remove = (idx: number) => {
        onChange(items.filter((_, i) => i !== idx).map((li, i) => ({ ...li, position: i })));
    };

    const subtotal = items.reduce((sum, li) => {
        const qty = Number(li.quantity) || 0;
        const price = Number(li.unitPrice) || 0;
        return sum + qty * price;
    }, 0);

    return (
        <div className="space-y-3">
            {items.map((li, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                        <Input
                            placeholder="Description"
                            value={li.description}
                            onChange={(e) => update(idx, { description: e.target.value })}
                            disabled={disabled}
                        />
                    </div>
                    <div className="col-span-2">
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={li.quantity}
                            onChange={(e) => update(idx, { quantity: e.target.value })}
                            disabled={disabled}
                        />
                    </div>
                    <div className="col-span-3">
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={li.unitPrice}
                            onChange={(e) => update(idx, { unitPrice: e.target.value })}
                            disabled={disabled}
                        />
                    </div>
                    <div className="col-span-1 flex justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(idx)}
                            disabled={disabled || items.length === 1}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}

            <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={add} disabled={disabled}>
                    <Plus className="h-4 w-4" /> Add line
                </Button>
                <p className="text-sm text-muted-foreground">
                    Subtotal: <span className="font-medium text-foreground">{subtotal.toFixed(2)}</span>
                </p>
            </div>
        </div>
    );
}