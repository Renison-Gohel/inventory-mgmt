"use client"

import { ColumnDef } from "@tanstack/react-table"

export type InventoryItem = {
  item_id: string
  name: string
  description: string
  quantity: number
  threshold: number
}

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "name",
    header: "Item Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "threshold",
    header: "Threshold",
  },
]

