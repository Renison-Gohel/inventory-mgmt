// @ts-nocheck

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { createFranchise, updateFranchise, deleteFranchise, updateFranchiseOwner, getFranchises } from "@/utils/db"
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

type Franchise = {
  id: string;
  name: string;
  location: string;
  owner_id: string;
  owner: { email: string } | null;
};

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
    cell: ({ row }: { row: { original: Franchise & { onAssignOwner: (franchise: Franchise) => void, onEditFranchise: (franchise: Franchise) => void, onDeleteFranchise: (id: string) => void } } }) => (
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => row.original.onAssignOwner(row.original)}
        >
          {row.original.owner_email ? "Edit Owner" : "Assign Owner"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => row.original.onEditFranchise(row.original)}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => row.original.onDeleteFranchise(row.original.id)}
        >
          Delete
        </Button>
      </div>
    ),
  },
]

export function FranchiseList({ onFranchiseCreated, onOperationResult }: { onFranchiseCreated: () => void, onOperationResult: (success: boolean, operation: string, itemType: string) => void }) {
  const [newFranchise, setNewFranchise] = useState({ name: "", location: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assigningOwner, setAssigningOwner] = useState<Franchise | null>(null)
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null)
  const [ownerEmail, setOwnerEmail] = useState("")
  const [franchiseList, setFranchiseList] = useState<Franchise[]>([]);

  useEffect(() => {
    fetchFranchises();
  }, []);

  const fetchFranchises = async () => {
    const { data: franchisesData, error } = await supabase
      .from('franchises')
      .select(`
        id,
        name,
        location,
        owner_id,
        owner:user_info ( email )
      `);

    if (error) {
      console.error('Error fetching franchises:', error);
    } else {
      setFranchiseList(franchisesData);
    }
  };

  const handleCreateFranchise = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await createFranchise(newFranchise.name, newFranchise.location, null)
      setNewFranchise({ name: "", location: "" })
      setIsDialogOpen(false)
      fetchFranchises()
      onOperationResult(true, "created", "Franchise")
    } catch (err) {
      console.error('Error creating franchise:', err)
      setError('Failed to create franchise. Please try again.')
      onOperationResult(false, "create", "Franchise")
    }
  }

  const handleUpdateFranchise = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (editingFranchise) {
      try {
        await updateFranchise(editingFranchise.id, editingFranchise.name, editingFranchise.location)
        setEditingFranchise(null)
        fetchFranchises()
        onOperationResult(true, "updated", "Franchise")
      } catch (err) {
        console.error('Error updating franchise:', err)
        setError('Failed to update franchise. Please try again.')
        onOperationResult(false, "update", "Franchise")
      }
    }
  }

  const handleDeleteFranchise = async (id: string) => {
    setError(null)
    try {
      await deleteFranchise(id)
      fetchFranchises()
      onOperationResult(true, "deleted", "Franchise")
    } catch (err) {
      console.error('Error deleting franchise:', err)
      setError('Failed to delete franchise. Please try again.')
      onOperationResult(false, "delete", "Franchise")
    }
  }

  const handleAssignOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (assigningOwner) {
      try {
        await updateFranchiseOwner(assigningOwner.id, ownerEmail)
        setAssigningOwner(null)
        setOwnerEmail("")
        fetchFranchises()
        onOperationResult(true, "updated", "Franchise owner")
      } catch (err) {
        console.error('Error assigning franchise owner:', err)
        setError('Failed to assign franchise owner. Please try again.')
        onOperationResult(false, "update", "Franchise owner")
      }
    }
  }

  const franchisesWithActions = franchiseList.map(franchise => ({
    ...franchise,
    owner_email: franchise.owner?.email || null,
    onAssignOwner: setAssigningOwner,
    onEditFranchise: setEditingFranchise,
    onDeleteFranchise: handleDeleteFranchise
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
      <Dialog open={!!editingFranchise} onOpenChange={(open) => !open && setEditingFranchise(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Franchise</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateFranchise} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={editingFranchise?.name || ""}
                onChange={(e) => setEditingFranchise(prev => prev ? {...prev, name: e.target.value} : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                value={editingFranchise?.location || ""}
                onChange={(e) => setEditingFranchise(prev => prev ? {...prev, location: e.target.value} : null)}
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
            <Button type="submit">Update Franchise</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FranchiseList;