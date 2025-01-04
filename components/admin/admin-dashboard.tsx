"use client"

import { useState, useEffect } from "react"
import { getFranchises, getInventoryItems } from "@/utils/db"
import { FranchiseList } from "./franchise-list"
import { InventoryManagement } from "./inventory-management"
import { InventoryItemsCRUD } from "./inventory-items-crud"
import { FranchiseInventoryView } from "./franchise-inventory-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { supabase } from "@/utils/supabase"
import { useToast } from "@/components/ui/use-toast"

export function AdminDashboard({ user }: { user: any }) {
  const [franchises, setFranchises] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const franchisesData = await getFranchises()
      const inventoryItemsData = await getInventoryItems()
      setFranchises(franchisesData)
      setInventoryItems(inventoryItemsData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data. Please try again.')
    }
  }

  useEffect(() => {
    fetchData()

    // Set up real-time listeners
    const franchisesSubscription = supabase
      .channel('franchises-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'franchises' }, fetchData)
      .subscribe()

    const inventoryItemsSubscription = supabase
      .channel('inventory-items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, fetchData)
      .subscribe()

    return () => {
      franchisesSubscription.unsubscribe()
      inventoryItemsSubscription.unsubscribe()
    }
  }, [])

  const handleOperationResult = (success: boolean, operation: string, itemType: string) => {
    if (success) {
      toast({
        title: "Success",
        description: `${itemType} ${operation} successfully.`,
      })
    } else {
      toast({
        title: "Error",
        description: `Failed to ${operation} ${itemType}. Please try again.`,
        variant: "destructive",
      })
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

  return (
    <Tabs defaultValue="franchises">
      <div className="overflow-x-auto">
        <TabsList className="h-10 items-center justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="franchises" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Franchises
          </TabsTrigger>
          <TabsTrigger value="inventory-items" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="inventory-management" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Inventory Management
          </TabsTrigger>
          <TabsTrigger value="franchise-inventory" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Franchise Inventory
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="franchises">
        <FranchiseList 
          franchises={franchises} 
          onFranchiseCreated={fetchData} 
          onOperationResult={handleOperationResult}
        />
      </TabsContent>
      <TabsContent value="inventory-items">
        <InventoryItemsCRUD 
          inventoryItems={inventoryItems} 
          onItemsChanged={fetchData} 
          onOperationResult={handleOperationResult}
        />
      </TabsContent>
      <TabsContent value="inventory-management">
        <InventoryManagement 
          inventoryItems={inventoryItems} 
          franchises={franchises} 
          onInventoryChanged={fetchData}
          onOperationResult={handleOperationResult}
        />
      </TabsContent>
      <TabsContent value="franchise-inventory">
        <FranchiseInventoryView />
      </TabsContent>
    </Tabs>
  )
}

