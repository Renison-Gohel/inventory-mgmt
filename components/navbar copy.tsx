"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

import { Session } from "@supabase/supabase-js"

export function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(session?.user ?? undefined)
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(undefined)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="font-bold">
          Inventory Management
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {user && pathname !== "/" && (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/requests">Requests</Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost">
                Sign Out
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}

