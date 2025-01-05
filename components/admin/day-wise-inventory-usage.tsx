// @ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { getFranchises, getDayWiseInventoryUsage } from "@/utils/db"
import { DataTable } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

const columns = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "item_name",
    header: "Item Name",
  },
  {
    accessorKey: "quantity_used",
    header: "Quantity Used",
    cell: ({ row }) => row.original.quantity_used.toLocaleString(),
  },
]

export function DayWiseInventoryUsage() {
  const [franchises, setFranchises] = useState([])
  const [selectedFranchise, setSelectedFranchise] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [usageData, setUsageData] = useState([])
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

  const handleFetchUsage = async () => {
    if (selectedFranchise && startDate && endDate) {
      try {
        const data = await getDayWiseInventoryUsage(selectedFranchise, startDate, endDate)
        setUsageData(data)
      } catch (err) {
        console.error('Error fetching usage data:', err)
        setError('Failed to fetch usage data. Please try again.')
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Day-wise Inventory Usage</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleFetchUsage}>Fetch Usage Data</Button>
        </div>
      </div>
      {usageData.length > 0 && (
        <DataTable columns={columns} data={usageData} />
      )}
    </div>
  )
}

