"use client"

import { ColumnDef } from "@tanstack/react-table"

export type InventoryItem = {
  id: string
  item_id: string
  quantity: number
  threshold: number
  inventory_items: {
    name: string
    description: string
  }
}

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "inventory_items.name",
    header: "Item Name",
  },
  {
    accessorKey: "inventory_items.description",
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

