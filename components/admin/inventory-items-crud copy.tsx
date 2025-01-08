import { useState } from "react"
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/utils/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export function InventoryItemsCRUD({ inventoryItems, onItemsChanged }: { inventoryItems: any[], onItemsChanged: () => void }) {
  const [newItem, setNewItem] = useState({ name: "", description: "" })
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await createInventoryItem(newItem.name, newItem.description)
      setNewItem({ name: "", description: "" })
      setIsDialogOpen(false)
      onItemsChanged()
    } catch (err) {
      console.error('Error creating inventory item:', err)
      setError('Failed to create inventory item. Please try again.')
    }
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await updateInventoryItem(editingItem.id, editingItem.name, editingItem.description)
      setEditingItem(null)
      setIsDialogOpen(false)
      onItemsChanged()
    } catch (err) {
      console.error('Error updating inventory item:', err)
      setError('Failed to update inventory item. Please try again.')
    }
  }

  const handleDeleteItem = async (id: string) => {
    setError(null)
    try {
      await deleteInventoryItem(id)
      onItemsChanged()
    } catch (err) {
      console.error('Error deleting inventory item:', err)
      setError('Failed to delete inventory item. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory Items</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingItem ? editingItem.name : newItem.name}
                  onChange={(e) => editingItem 
                    ? setEditingItem({ ...editingItem, name: e.target.value })
                    : setNewItem({ ...newItem, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingItem ? editingItem.description : newItem.description}
                  onChange={(e) => editingItem
                    ? setEditingItem({ ...editingItem, description: e.target.value })
                    : setNewItem({ ...newItem, description: e.target.value })
                  }
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit">{editingItem ? "Update Item" : "Create Item"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => {
                    setEditingItem(item)
                    setIsDialogOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

