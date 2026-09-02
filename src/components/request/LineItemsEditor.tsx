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
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="lineItems" value={JSON.stringify(items)} />

      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start gap-2">
            <Input
              value={item.description}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              placeholder="e.g. Labour, Call-out fee, Replacement valve"
              className="bg-white"
              aria-label="Line item description"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length === 1}
              className="mt-2 flex-shrink-0 px-1 text-lg leading-none text-slate-400 hover:text-red-600 disabled:opacity-30"
              aria-label="Remove line item"
            >
              ×
            </button>
          </div>
          <div className="mt-2 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Qty</span>
              <Input
                type="number"
                min="0"
                step="0.25"
                inputMode="decimal"
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                className="bg-white"
                aria-label="Quantity"
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Unit price</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                className="bg-white"
                aria-label="Unit price"
              />
            </div>
            <div className="pb-2.5 text-right text-sm font-semibold text-slate-900 min-w-[4.5rem]">
              {formatCurrency(item.quantity * item.unitPrice)}
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="ghost" onClick={addItem} className="self-start">
        + Add line item
      </Button>

      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
        <span className="text-sm font-medium text-slate-500">Total</span>
        <span className="text-xl font-bold text-slate-900">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
