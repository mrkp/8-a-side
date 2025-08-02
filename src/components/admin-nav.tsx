"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Users, 
  Trophy, 
  BarChart3, 
  Calendar,
  ArrowLeftRight,
  Settings,
  Home
} from "lucide-react"

const navItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: Home
  },
  {
    title: "Teams",
    href: "/admin/teams",
    icon: Users
  },
  {
    title: "Players",
    href: "/admin/players",
    icon: Trophy
  },
  {
    title: "Fixtures",
    href: "/admin/fixtures",
    icon: Calendar
  },
  {
    title: "Rankings",
    href: "/admin/rankings",
    icon: BarChart3
  },
  {
    title: "Trades",
    href: "/admin/trades",
    icon: ArrowLeftRight
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card/50 min-h-screen">
      <nav className="p-4 space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground mb-4">
          Admin Navigation
        </h3>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
                          (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}