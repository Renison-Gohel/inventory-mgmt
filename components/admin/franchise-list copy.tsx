import { useState } from "react"
import { createFranchise, updateFranchiseOwner, getFranchises } from "@/utils/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

// Define columns for the DataTable
const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "owner_email",
    header: "Owner",
    cell: ({ row }: { row: { original: { owner_email: string | null } } }) => row.original.owner_email || "Not assigned",
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: { owner_email: string | null, onAssignOwner: (franchise: any) => void } } }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => row.original.onAssignOwner(row.original)}
      >
        {row.original.owner_email ? "Edit Owner" : "Assign Owner"}
      </Button>
    ),
  },
]

export function FranchiseList({ franchises, onFranchiseCreated, onOperationResult }: { franchises: any[], onFranchiseCreated: () => void, onOperationResult: (success: boolean, operation: string, itemType: string) => void }) {
  const [newFranchise, setNewFranchise] = useState({ name: "", location: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assigningOwner, setAssigningOwner] = useState<any>(null)
  const [ownerEmail, setOwnerEmail] = useState("")

  const handleCreateFranchise = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await createFranchise(newFranchise.name, newFranchise.location, null)
      setNewFranchise({ name: "", location: "" })
      setIsDialogOpen(false)
      onFranchiseCreated()
      onOperationResult(true, "created", "Franchise")
    } catch (err) {
      console.error('Error creating franchise:', err)
      setError('Failed to create franchise. Please try again.')
      onOperationResult(false, "create", "Franchise")
    }
  }

  const handleAssignOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await updateFranchiseOwner(assigningOwner.id, ownerEmail)
      setAssigningOwner(null)
      setOwnerEmail("")
      onFranchiseCreated()
      onOperationResult(true, "updated", "Franchise owner")
    } catch (err) {
      console.error('Error assigning franchise owner:', err)
      setError('Failed to assign franchise owner. Please try again.')
      onOperationResult(false, "update", "Franchise owner")
    }
  }

  const franchisesWithActions = franchises.map(franchise => ({
    ...franchise,
    onAssignOwner: setAssigningOwner
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Franchises</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Franchise</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Franchise</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFranchise} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newFranchise.name}
                  onChange={(e) => setNewFranchise({ ...newFranchise, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newFranchise.location}
                  onChange={(e) => setNewFranchise({ ...newFranchise, location: e.target.value })}
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
              <Button type="submit">Create Franchise</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={franchisesWithActions} />
      <Dialog open={!!assigningOwner} onOpenChange={(open) => !open && setAssigningOwner(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Owner to {assigningOwner?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignOwner} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
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
            <Button type="submit">Assign Owner</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

