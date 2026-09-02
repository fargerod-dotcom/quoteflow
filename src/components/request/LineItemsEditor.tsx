"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { LineItem } from "@/lib/ai/schema";

export function LineItemsEditor({ initialLineItems }: { initialLineItems: LineItem[] }) {
  const [items, setItems] = useState<LineItem[]>(
    initialLineItems.length > 0 ? initialLineItems : [{ description: "", quantity: 1, unitPrice: 0 }]
  );

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="lineItems" value={JSON.stringify(items)} />

      <div className="grid grid-cols-[1fr_5rem_6rem_2rem] gap-2 text-xs font-medium text-slate-500">
        <span>Description</span>
        <span>Qty</span>
        <span>Unit price</span>
        <span />
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_5rem_6rem_2rem] gap-2">
          <Input
            value={item.description}
            onChange={(e) => updateItem(index, { description: e.target.value })}
            placeholder="Line item description"
          />
          <Input
            type="number"
            min="0"
            step="0.1"
            value={item.quantity}
            onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Remove line item"
          >
            ×
          </button>
        </div>
      ))}

      <Button type="button" variant="ghost" onClick={addItem} className="self-start">
        + Add line item
      </Button>

      <div className="mt-2 flex justify-end border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
        Total: {formatCurrency(total)}
      </div>
    </div>
  );
}
