"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { toast } from "sonner"

const ADMIN_PASSWORD = "Wam2ubai"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    if (password === ADMIN_PASSWORD) {
      // Set cookie for middleware
      document.cookie = `adminAuth=true; path=/; max-age=${60 * 60 * 24}` // 24 hours
      
      // Also set session storage for client-side checks
      sessionStorage.setItem("adminAuthenticated", "true")
      sessionStorage.setItem("adminAuthTime", Date.now().toString())
      
      toast.success("Access granted!")
      
      // Redirect to admin page
      const redirectTo = sessionStorage.getItem("adminRedirectTo") || "/admin"
      sessionStorage.removeItem("adminRedirectTo")
      router.push(redirectTo)
    } else {
      setError(true)
      setPassword("")
      toast.error("Invalid password")
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <QPCCHeader />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Admin Access
          </CardTitle>
          <CardDescription>
            Enter the password to access the administration panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Invalid password. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password}
            >
              {loading ? "Verifying..." : "Access Admin Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}