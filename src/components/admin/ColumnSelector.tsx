"use client"

import { hgnColumnOptions } from "@/lib/column-options"

export default function ColumnSelector({
  defaultValue = "",
  name = "column_name",
}: {
  defaultValue?: string
  name?: string
}) {
  return (
    <label className="block text-sm font-bold">
      Column / Columnist Series
      <select name={name} defaultValue={defaultValue || ""} className="mt-2 w-full rounded-2xl border px-4 py-3">
        <option value="">Not a columnist column</option>
        {hgnColumnOptions.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>
    </label>
  )
}
