"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { FranchiseDashboard } from "@/components/franchise/franchise-dashboard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        // if (error) throw error
        if (error){
          console.log('Error fetching user: ', error);
          
        }
        if (user) {
          setUser(user)
          console.log('User: ', user);
          
        } else {
          router.push("/")
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('Failed to fetch user data. Please try again.')
      }
    }
    fetchUser()
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      // if (error) throw error
      if (error){
        console.log('Error signing out: ', error);
      }
      router.push("/")
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out. Please try again.')
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

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
      {user.user_metadata.user_type === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <FranchiseDashboard user={user} />
      )}
    </div>
  )
}

