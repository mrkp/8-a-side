import Link from "next/link"

export function QPCCHeader() {
  return (
    <Link href="/" className="flex items-center">
      <img 
        src="/8-a-side-logo.png" 
        alt="QPCC 8-A-SIDE Football Tournament"
        className="h-14 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
      />
    </Link>
  )
}