export default function ConnectLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-5 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-40" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  );
}
