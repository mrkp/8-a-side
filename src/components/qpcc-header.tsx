export function QPCCHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 overflow-hidden rounded-md">
        <img 
          src="https://qpcc.com/wp-content/uploads/2019/11/cropped-2b8a463394b57835284996f0fec000e5.png" 
          alt="QPCC Logo"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Official</span>
        <span className="font-bold text-sm">QPCC 8-A-SIDE</span>
      </div>
    </div>
  )
}