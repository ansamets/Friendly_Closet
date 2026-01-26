"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFeed } from "@/lib/api";
import { Item } from "@/lib/types";
import Link from "next/link";

import dynamic from "next/dynamic";
const MapWithNoSSR = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-stone-100 animate-pulse rounded-2xl text-center pt-24 text-muted">
      Loading Map...
    </div>
  ),
});

export default function HomePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (user) {
      getFeed().then((feedData) => {
        setItems(feedData.filter((i) => i.user_id === user.id));
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center mt-10 space-y-3">
        <p>Please log in.</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center border-b pb-4 border-stone-200">
        <h1 className="text-3xl font-light tracking-tight text-primary">
          My <span className="font-bold">Map</span>
        </h1>
      </div>

      <div className="mb-6">
        <MapWithNoSSR items={items} />
        {items.length > 0 ? (
          <p className="text-xs text-center text-muted mt-2">Locations you've visited</p>
        ) : (
          <p className="text-xs text-center text-muted mt-2">
            No locations yet. Add an item with a location to see pins here.
          </p>
        )}
      </div>
    </div>
  );
}
