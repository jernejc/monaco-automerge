export function CircularSpinner({ size = 1, }: { size?: number }) {
  return (
    <div className="flex justify-center items-center gap-2 my-4">
      <div className="animate-spin rounded-full border-2 border-green-700 dark:border-green-900 border-t-green-900 dark:border-t-green-700" style={{ width: `${size}em`, height: `${size}em` }}></div>
      <span className="text-sm text-green-700">Loading..</span>
    </div>
  );
}