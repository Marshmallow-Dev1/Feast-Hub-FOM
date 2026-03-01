export default function DashboardLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-5 pb-20 md:pb-6 animate-pulse">
      {/* Hero card skeleton */}
      <div className="bg-[#ff474f]/30 rounded-2xl p-5 h-24" />

      {/* Action cards skeleton */}
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-16" />
        ))}
      </div>
    </div>
  );
}
