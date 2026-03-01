export default function AdminSettingsLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-4 pb-20 md:pb-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-36" />
      <div className="bg-white rounded-2xl p-5 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded w-32" />
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        ))}
        <div className="h-10 bg-gray-200 rounded-xl mt-2" />
      </div>
    </div>
  );
}
