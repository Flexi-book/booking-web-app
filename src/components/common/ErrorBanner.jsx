export default function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
      <p className="text-sm font-medium text-red-800">{message}</p>
    </div>
  )
}
