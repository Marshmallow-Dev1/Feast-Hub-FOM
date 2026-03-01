export default function AdminQrCodesLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 md:pb-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-40" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-40 w-40 bg-gray-100 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded-xl w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
