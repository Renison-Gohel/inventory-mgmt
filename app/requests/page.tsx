//@ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { updateInventoryRequestStatus } from "@/utils/db"
import { Button } from "@/components/ui/button"
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

export default function InventoryRequests() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState<string | null>(null)

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
      await updateInventoryRequestStatus(requestId, status)
      // Refresh requests
      const updatedRequests = requests.map(request =>
        request.id === requestId ? { ...request, status } : request
      )
      setRequests(updatedRequests)
    } catch (err) {
      console.error('Error updating request status:', err)
      setError('Failed to update request status. Please try again.')
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
            <TableHead>Quantity</TableHead>
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

