export default function Tooltip({ message, children }: { message: string, children: any }) {
  return (
    <div className="group relative flex w-full">
      {children}
      <div className={`absolute scale-0 px-2 transition-all rounded bg-black dark:bg-gray-200 dark:text-black text-xs text-white group-hover:scale-125 z-40 top-1 left-1 p-2 min-w-80`}>
        {message}
      </div>
    </div>
  )
}