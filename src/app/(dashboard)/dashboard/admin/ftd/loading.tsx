export default function AdminFtdLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 flex gap-4">
            <div className="h-24 w-24 bg-gray-200 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-3.5 bg-gray-100 rounded w-32" />
              <div className="h-3.5 bg-gray-100 rounded w-28 mt-2" />
              <div className="flex gap-2 mt-3">
                <div className="h-8 bg-gray-200 rounded-xl w-24" />
                <div className="h-8 bg-gray-200 rounded-xl w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
