"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="font-bold">
          Inventory Management
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {pathname !== "/" && (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/requests">Requests</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}

