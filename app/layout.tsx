import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "Manage inventory for multiple food outlet franchises",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <Navbar session={session} />
            <main className="container mx-auto py-4">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

