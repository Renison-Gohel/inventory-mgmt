//@ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { fulfillInventoryRequest } from "@/utils/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

export default function InventoryRequests() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [fulfilledQuantities, setFulfilledQuantities] = useState({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_requests')
          .select(`
            *,
            franchises (name),
            inventory_items (name)
          `)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setRequests(data)
      } catch (err) {
        console.error('Error fetching requests:', err)
        setError('Failed to fetch inventory requests. Please try again.')
      }
    }

    fetchRequests()
  }, [])

  const handleUpdateStatus = async (requestId: string, status: 'Fulfilled' | 'Rejected') => {
    try {
      if (status === 'Fulfilled') {
        const fulfilledQuantity = fulfilledQuantities[requestId]
        if (!fulfilledQuantity) {
          toast({
            title: "Error",
            description: "Please enter a fulfilled quantity.",
            variant: "destructive",
          })
          return
        }
        await fulfillInventoryRequest(requestId, fulfilledQuantity)
      } else {
        // For rejected requests, we'll just update the status
        await supabase
          .from('inventory_requests')
          .update({ status })
          .eq('id', requestId)
      }
      
      // Refresh requests
      const updatedRequests = requests.map(request =>
        request.id === requestId ? { ...request, status } : request
      )
      setRequests(updatedRequests)
      
      toast({
        title: "Success",
        description: `Request ${status.toLowerCase()} successfully.`,
      })
    } catch (err) {
      console.error('Error updating request status:', err)
      toast({
        title: "Error",
        description: "Failed to update request status. Please try again.",
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventory Requests</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Franchise</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Quantity Requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.franchises.name}</TableCell>
              <TableCell>{request.inventory_items.name}</TableCell>
              <TableCell>{request.quantity_requested}</TableCell>
              <TableCell>{request.status}</TableCell>
              <TableCell>
                {request.status === 'Pending' && (
                  <>
                    <Input
                      type="number"
                      placeholder="Fulfilled Quantity"
                      className="w-40 mr-2 mb-2"
                      onChange={(e) => setFulfilledQuantities({
                        ...fulfilledQuantities,
                        [request.id]: parseInt(e.target.value)
                      })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleUpdateStatus(request.id, 'Fulfilled')}
                    >
                      Fulfill
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

