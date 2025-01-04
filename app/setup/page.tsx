"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { CreateAdmin } from "@/components/auth/create-admin"

export default function Setup() {
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const router = useRouter()

  // useEffect(() => {
    // const checkUsers = async () => {
      // const { count, error } = await supabase
        // .from('user_info')
        // .select('*', { count: 'exact', head: true })

      // if (error) {
        // console.error('Error checking users:', error)
        // return
      // }

      // if (count === 0) {
        // setShowSetup(true)
      // } 
      // else {
        // router.push('/')
      // }
      // setLoading(false)
    // }

    // checkUsers()
  // }, [router])

  // if (loading) {
    // return <div>Loading...</div>
  // }

  // if (!showSetup) {
    // return null
  // }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Create Admin User</h1>
        <CreateAdmin />
      </div>
    </div>
  )
}

