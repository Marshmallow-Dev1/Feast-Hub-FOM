export default function TithesLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-4 pb-20 md:pb-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-40" />

      {/* QR card */}
      <div className="bg-gray-100 rounded-2xl p-5 flex flex-col items-center gap-3">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-48 w-48 bg-gray-200 rounded-xl" />
        <div className="h-4 bg-gray-200 rounded w-40" />
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl p-5 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded w-28" />
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        ))}
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
