// @ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { getRealTimeInventory, recordInventoryUsage, createInventoryRequest } from "@/utils/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { supabase } from "@/utils/supabase"
import { useToast } from "@/components/ui/use-toast"

const columns = [
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
  {
    id: "actions",
    cell: ({ row }) => (
      <div>
        <Button
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={() => row.original.onRecordUsage(row.original)}
        >
          Record Usage
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => row.original.onRequestInventory(row.original)}
        >
          Request
        </Button>
      </div>
    ),
  },
]

export function FranchiseDashboard({ user }: { user: any }) {
  const [franchise, setFranchise] = useState<any>(null)
  const [inventory, setInventory] = useState([])
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [usageAmount, setUsageAmount] = useState(0)
  const [requestAmount, setRequestAmount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchInventory = async (franchiseId) => {
    try {
      const inventoryData = await getRealTimeInventory(franchiseId)
      setInventory(inventoryData)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError('Failed to fetch inventory. Please try again.')
    }
  }

  useEffect(() => {
    const fetchFranchiseAndInventory = async () => {
      try {
        // Fetch the user's franchise
        const { data: franchiseData, error: franchiseError } = await supabase
          .from('franchises')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (franchiseError) throw franchiseError
        setFranchise(franchiseData)

        // Fetch the franchise inventory
        if (franchiseData) {
          await fetchInventory(franchiseData.id)
        }
      } catch (err) {
        console.error('Error fetching franchise and inventory:', err)
        setError('Failed to fetch franchise data. Please try again.')
      }
    }

    fetchFranchiseAndInventory()

    // Set up real-time listener for inventory changes
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'franchise_inventory' }, () => {
        if (franchise) {
          fetchInventory(franchise.id)
        }
      })
      .subscribe()

    return () => {
      inventorySubscription.unsubscribe()
    }
  }, [user.id])

  const handleRecordUsage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItem && franchise) {
      try {
        await recordInventoryUsage(franchise.id, selectedItem.item_id, usageAmount, new Date().toISOString())
        setIsUsageDialogOpen(false)
        setSelectedItem(null)
        setUsageAmount(0)
        toast({
          title: "Success",
          description: "Usage recorded successfully.",
        })
        await fetchInventory(franchise.id)
      } catch (err) {
        console.error('Error recording usage:', err)
        toast({
          title: "Error",
          description: err.message || "Failed to record usage. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleRequestInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItem && franchise) {
      try {
        await createInventoryRequest(franchise.id, selectedItem.item_id, requestAmount)
        setIsRequestDialogOpen(false)
        setSelectedItem(null)
        setRequestAmount(0)
        toast({
          title: "Success",
          description: "Inventory request submitted successfully.",
        })
      } catch (err) {
        console.error('Error requesting inventory:', err)
        toast({
          title: "Error",
          description: "Failed to request inventory. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!franchise) {
    return <div>No franchise assigned. Please contact an administrator.</div>
  }

  const inventoryWithActions = inventory.map(item => ({
    ...item,
    onRecordUsage: () => {
      setSelectedItem(item)
      setIsUsageDialogOpen(true)
    },
    onRequestInventory: () => {
      setSelectedItem(item)
      setIsRequestDialogOpen(true)
    }
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Franchise Inventory - {franchise.name}</h2>
      <DataTable columns={columns} data={inventoryWithActions} />

      <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Usage</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordUsage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usage">Usage Amount (Max: {selectedItem?.quantity})</Label>
              <Input
                id="usage"
                type="number"
                min="1"
                max={selectedItem?.quantity}
                value={usageAmount}
                onChange={(e) => setUsageAmount(parseInt(e.target.value))}
                required
              />
            </div>
            <Button type="submit">Record Usage</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Inventory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestInventory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="request">Request Amount</Label>
              <Input
                id="request"
                type="number"
                min="1"
                value={requestAmount}
                onChange={(e) => setRequestAmount(parseInt(e.target.value))}
                required
              />
            </div>
            <Button type="submit">Submit Request</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

