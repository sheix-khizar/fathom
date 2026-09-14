export default function TopBar() {
  return (
    <header className="flex h-14 items-center border-b border-gray-800 px-6">
      <input
        type="text"
        placeholder="Search meetings..."
        className="w-72 rounded-md border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </header>
  );
}
