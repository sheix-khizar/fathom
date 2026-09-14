import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/search", label: "Search" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-800 bg-gray-950 p-4">
      <div className="mb-8 text-lg font-semibold text-white">Fathom</div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
