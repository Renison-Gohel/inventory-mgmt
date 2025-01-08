// @ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { getFranchises, getRealTimeInventory, updateFranchiseInventory, deleteFranchiseInventoryItem, getInventoryItems } from "@/utils/db"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { supabase } from "@/utils/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export function FranchiseInventoryView() {
  const { toast } = useToast()
  const [franchises, setFranchises] = useState([])
  const [selectedFranchise, setSelectedFranchise] = useState("")
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({ item_id: "", quantity: 0, threshold: 0 })
  const [editingItem, setEditingItem] = useState(null)
  const [inventoryItems, setInventoryItems] = useState([])

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const franchisesData = await getFranchises()
        setFranchises(franchisesData)
      } catch (err) {
        console.error('Error fetching franchises:', err)
        setError('Failed to fetch franchises. Please try again.')
      }
    }

    const fetchInventoryItems = async () => {
      try {
        const items = await getInventoryItems()
        setInventoryItems(items)
      } catch (err) {
        console.error('Error fetching inventory items:', err)
        setError('Failed to fetch inventory items. Please try again.')
      }
    }

    fetchFranchises()
    fetchInventoryItems()
  }, [])

  useEffect(() => {
    const fetchInventory = async () => {
      if (selectedFranchise) {
        try {
          const inventoryData = await getRealTimeInventory(selectedFranchise)
          setInventory(inventoryData)
        } catch (err) {
          console.error('Error fetching inventory:', err)
          setError('Failed to fetch inventory. Please try again.')
        }
      }
    }

    fetchInventory()

    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'franchise_inventory' }, () => {
        if (selectedFranchise) {
          fetchInventory()
        }
      })
      .subscribe()

    return () => {
      inventorySubscription.unsubscribe()
    }
  }, [selectedFranchise])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await updateFranchiseInventory(selectedFranchise, newItem.item_id, newItem.quantity, newItem.threshold)
      setIsAddDialogOpen(false)
      setNewItem({ item_id: "", quantity: 0, threshold: 0 })
      toast({
        title: "Success",
        description: "Inventory item added successfully.",
      })
      const updatedInventory = await getRealTimeInventory(selectedFranchise)
      setInventory(updatedInventory)
    } catch (err) {
      console.error('Error adding inventory item:', err)
      setError('Failed to add inventory item. Please try again.')
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (!editingItem) return;
      await updateFranchiseInventory(selectedFranchise, editingItem.item_id, editingItem.quantity, editingItem.threshold)
      setIsEditDialogOpen(false)
      setEditingItem(null)
      toast({
        title: "Success",
        description: "Inventory item updated successfully.",
      })
      const updatedInventory = await getRealTimeInventory(selectedFranchise)
      setInventory(updatedInventory)
    } catch (err) {
      console.error('Error updating inventory item:', err)
      setError('Failed to update inventory item. Please try again.')
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    setError(null)
    try {
      await deleteFranchiseInventoryItem(id)
      toast({
        title: "Success",
        description: "Inventory item deleted successfully.",
      })
      const updatedInventory = await getRealTimeInventory(selectedFranchise)
      setInventory(updatedInventory)
    } catch (err) {
      console.error('Error deleting inventory item:', err)
      setError('Failed to delete inventory item. Please try again.')
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const inventoryWithActions = inventory.map(item => ({
    ...item,
    onEdit: () => {
      setEditingItem(item)
      setIsEditDialogOpen(true)
    },
    onDelete: () => handleDeleteItem(item.id)
  }))

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="franchise-select">Select Franchise</Label>
        <Select onValueChange={setSelectedFranchise} value={selectedFranchise}>
          <SelectTrigger id="franchise-select">
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
      {selectedFranchise && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="item_id">Item</Label>
                    <Select onValueChange={(value) => setNewItem({ ...newItem, item_id: value })}>
                      <SelectTrigger id="item_id">
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
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={newItem.threshold}
                      onChange={(e) => setNewItem({ ...newItem, threshold: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <Button type="submit">Add Item</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable columns={columns} data={inventoryWithActions} />
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Inventory Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditItem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingItem?.quantity || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-threshold">Threshold</Label>
                  <Input
                    id="edit-threshold"
                    type="number"
                    value={editingItem?.threshold || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, threshold: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <Button type="submit">Update Item</Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
