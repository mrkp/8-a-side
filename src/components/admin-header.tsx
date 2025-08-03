"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { QPCCHeader } from "@/components/qpcc-header"
import { ArrowLeft, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AdminHeaderProps {
  title: string
  backTo?: string
  backLabel?: string
}

export function AdminHeader({ title, backTo = "/", backLabel = "Back to Home" }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Clear auth cookie
    document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Clear session storage
    sessionStorage.removeItem("adminAuthenticated")
    sessionStorage.removeItem("adminAuthTime")
    
    toast.success("Logged out successfully")
    router.push("/")
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <QPCCHeader />
            <Separator orientation="vertical" className="h-8" />
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={backTo}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}