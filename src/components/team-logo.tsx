import Image from "next/image"
import { cn } from "@/lib/utils"

interface TeamLogoProps {
  src?: string | null
  alt: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  fallback?: boolean
}

const sizeMap = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16"
}

export function TeamLogo({ 
  src, 
  alt, 
  size = "md", 
  className,
  fallback = true 
}: TeamLogoProps) {
  // If no logo, show fallback
  if (!src && fallback) {
    return (
      <div className={cn(
        "bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground",
        sizeMap[size],
        className
      )}>
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  if (!src) return null

  // For SVG files, use img tag for better compatibility
  if (src.endsWith('.svg')) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("object-contain", sizeMap[size], className)}
      />
    )
  }

  // For other formats, use Next.js Image with unoptimized flag for WebP
  return (
    <div className={cn("relative", sizeMap[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        unoptimized={src.endsWith('.webp')}
      />
    </div>
  )
}