"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusSquare, Users, Newspaper } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const HangerIcon = ({ size = 24, className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
    >
      <path d="M12 3a3 3 0 0 0-2.83 2H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-4.17A3 3 0 0 0 12 3z"/>
      <path d="m12 9 0 12" />
    </svg>
  );

  const navItems = [
    { href: "/home", label: "Rankings", icon: HangerIcon },
    { href: "/feed", label: "Feed", icon: Newspaper },
    { href: "/add", label: "Add", icon: PlusSquare },
    { href: "/friends", label: "Friends", icon: Users },
  ];

  return (
    // Changed "absolute bottom-0" to just be part of the flex column (safer)
    <nav className="w-full bg-white border-t border-gray-100 h-20 flex items-center justify-center z-50">

      {/* Container to spread icons evenly */}
      <div className="w-full md:w-2/3 flex justify-around items-center px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-blue-600 bg-blue-50" // Standard Blue (Safe)
                  : "text-gray-400 hover:bg-gray-50" // Standard Gray (Safe)
              }`}
            >
              <Icon size={24} />
              {isActive && <span className="text-[10px] font-bold mt-1">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
