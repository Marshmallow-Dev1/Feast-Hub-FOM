export default function AdminFinanceLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-20 md:pb-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-44" />
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="h-10 bg-gray-100 border-b border-gray-50" />
        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-50">
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
