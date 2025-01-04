"use client"

import { useState, useEffect } from "react"
import { getFranchises, getRealTimeInventory } from "@/utils/db"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { supabase } from "@/utils/supabase"

export function FranchiseInventoryView() {
  const [franchises, setFranchises] = useState([])
  const [selectedFranchise, setSelectedFranchise] = useState("")
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState<string | null>(null)

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

    fetchFranchises()
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

    // Set up real-time listener for inventory changes
    const inventorySubscription = supabase
      .channel('franchise-inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'franchise_inventory' }, fetchInventory)
      .subscribe()

    return () => {
      inventorySubscription.unsubscribe()
    }
  }, [selectedFranchise])

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
        <DataTable columns={columns} data={inventory} />
      )}
    </div>
  )
}

