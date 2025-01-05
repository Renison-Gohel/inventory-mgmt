import { useState } from "react"
import { createInventoryItem, updateFranchiseInventory } from "@/utils/db"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function InventoryManagement({ inventoryItems, franchises }: { inventoryItems: any[], franchises: any[] }) {
  const [newItem, setNewItem] = useState({ name: "", description: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFranchise, setSelectedFranchise] = useState("")
  const [itemAssignment, setItemAssignment] = useState({ itemId: "", quantity: 0, threshold: 0 })

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    await createInventoryItem(newItem.name, newItem.description)
    setNewItem({ name: "", description: "" })
    setIsDialogOpen(false)
    // TODO: Refresh inventory items list
  }

  const handleAssignItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFranchise && itemAssignment.itemId) {
      await updateFranchiseInventory(
        selectedFranchise,
        itemAssignment.itemId,
        itemAssignment.quantity,
        itemAssignment.threshold
      )
      setItemAssignment({ itemId: "", quantity: 0, threshold: 0 })
      // TODO: Refresh inventory items list
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
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Create Item</Button>
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
                <Button variant="outline" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Assign Items to Franchise</h3>
        <form onSubmit={handleAssignItem} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="franchise">Franchise</Label>
            <Select onValueChange={(value) => setSelectedFranchise(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a franchise" />
              </SelectTrigger>
              <SelectContent>
                {franchises.map((franchise) => (
                  <SelectItem key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="item">Item</Label>
            <Select onValueChange={(value) => setItemAssignment({ ...itemAssignment, itemId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {inventoryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={itemAssignment.quantity}
              onChange={(e) => setItemAssignment({ ...itemAssignment, quantity: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold</Label>
            <Input
              id="threshold"
              type="number"
              value={itemAssignment.threshold}
              onChange={(e) => setItemAssignment({ ...itemAssignment, threshold: parseInt(e.target.value) })}
              required
            />
          </div>
          <Button type="submit">Assign Item</Button>
        </form>
      </div>
    </div>
  )
}

