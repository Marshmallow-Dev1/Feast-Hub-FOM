export default function AdminServantsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-52" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-3.5 bg-gray-100 rounded w-32" />
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded-xl w-24" />
              <div className="h-8 bg-gray-200 rounded-xl w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
