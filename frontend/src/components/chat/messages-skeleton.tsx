export default function MessagesSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-2 items-end animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-40 rounded-2xl bg-gray-200 dark:bg-[#3a3a3a]" />
            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-[#3a3a3a]" />
          </div>
        </div>
      ))}
    </div>
  )
}
