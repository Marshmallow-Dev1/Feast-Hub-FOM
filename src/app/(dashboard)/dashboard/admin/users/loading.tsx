export default function AdminUsersLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-20 md:pb-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-40" />
      {/* Search bar */}
      <div className="h-10 bg-gray-100 rounded-xl" />
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="h-10 bg-gray-100 border-b border-gray-50" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-50 items-center">
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded w-36" />
              <div className="h-3 bg-gray-100 rounded w-48" />
            </div>
            <div className="h-5 bg-gray-200 rounded-full w-24" />
            <div className="h-7 bg-gray-200 rounded-lg w-28" />
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
