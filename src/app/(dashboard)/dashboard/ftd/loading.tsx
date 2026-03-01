export default function FtdLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-4 pb-20 md:pb-6 animate-pulse">
      {/* Page title */}
      <div className="h-8 bg-gray-200 rounded-lg w-48" />

      {/* Schedule card */}
      <div className="bg-gray-100 rounded-2xl p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-40" />
        <div className="h-4 bg-gray-200 rounded w-36" />
      </div>

      {/* Upload card */}
      <div className="bg-gray-100 rounded-2xl p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-36" />
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
