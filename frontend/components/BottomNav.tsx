"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// Make sure you ran: npm install react-icons
import {
  HiOutlineUserAdd,
  HiPlusCircle,
  HiOutlineGlobe,
  HiUserGroup,
} from "react-icons/hi";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: "/friends", label: "Add", icon: HiOutlineUserAdd },
    { href: "/feed", label: "Feed", icon: HiUserGroup },
    { href: "/add", label: "Add", icon: HiPlusCircle, isCenter: true },
    // Note: You need to create a /map page for this to work, otherwise it 404s
    { href: "/home", label: "Map", icon: HiOutlineGlobe },
    { href: "/stats", label: "Me", icon: HiUserGroup },
  ];

  return (
    <nav
      className="
        w-full z-50
        bg-white/90 backdrop-blur-xl
        border-t border-stone-200
        pb-safe
      "
    >
      <div className="mx-auto max-w-md px-4">
        <div className="grid grid-cols-5 items-center gap-2 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            // Center “Add” button (raised)
            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center relative -top-5"
                >
                  <div
                    className="
                      flex h-14 w-14 items-center justify-center rounded-full
                      bg-stone-900 text-white shadow-xl
                      ring-4 ring-white
                      active:scale-95 transition-transform
                    "
                    aria-label={item.label}
                  >
                  <Icon className="h-8 w-8" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="
                  flex flex-col items-center justify-center
                  rounded-2xl py-1
                  transition
                  active:scale-95
                "
              >
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-xl transition-colors
                    ${isActive ? "text-stone-900" : "text-stone-400 group-hover:text-stone-600"}
                  `}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <span
                  className={`mt-1 text-xs font-semibold ${
                    isActive ? "text-stone-900" : "text-stone-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
