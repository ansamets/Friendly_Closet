"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { compareStores, getFeed, getImageUrl, getRankings } from "@/lib/api";
import { Item, StoreRanking } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

export default function StatsPage() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<StoreRanking[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [comparePair, setComparePair] = useState<{ left: number; right: number } | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const getTagColor = (type: string) => {
    if (type.includes("luxury")) return "bg-pastel-purple text-purple-700";
    if (type.includes("thrift")) return "bg-pastel-green text-green-700";
    if (type.includes("boutique")) return "bg-pastel-pink text-pink-700";
    return "bg-pastel-blue text-blue-700";
  };

  useEffect(() => {
    if (user) {
      getRankings(user.id).then(setRankings);
      getFeed().then((feedData) => {
        setItems(feedData.filter((i) => i.user_id === user.id));
      });
    }
  }, [user]);

  const uniqueStores = useMemo(() => {
    const map = new Map<number, { id: number; name: string; store_type: string }>();
    items.forEach((item) => {
      if (!map.has(item.store_id)) {
        map.set(item.store_id, {
          id: item.store_id,
          name: item.store.name,
          store_type: item.store.store_type,
        });
      }
    });
    return Array.from(map.values());
  }, [items]);

  const pickPair = (stores: { id: number }[]) => {
    const firstIdx = Math.floor(Math.random() * stores.length);
    let secondIdx = Math.floor(Math.random() * (stores.length - 1));
    if (secondIdx >= firstIdx) secondIdx += 1;
    return { left: stores[firstIdx].id, right: stores[secondIdx].id };
  };

  const needsComparison = uniqueStores.length > rankings.length;

  useEffect(() => {
    if (needsComparison && uniqueStores.length >= 2) {
      setComparePair((prev) => prev ?? pickPair(uniqueStores));
    } else {
      setComparePair(null);
    }
  }, [needsComparison, uniqueStores.length]);

  const handleCompare = async (winnerId: number, loserId: number) => {
    if (!user) return;
    setCompareLoading(true);
    try {
      await compareStores(user.id, winnerId, loserId);
      const updated = await getRankings(user.id);
      setRankings(updated);
      if (uniqueStores.length > updated.length) {
        setComparePair(pickPair(uniqueStores));
      } else {
        setComparePair(null);
      }
    } finally {
      setCompareLoading(false);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold mb-4">My Top Brands</h1>
        <div className="bg-white rounded-xl shadow border">
          {rankings.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No rankings yet. Start comparing!</p>
          ) : (
            <ul className="divide-y">
              {rankings.map((store, idx) => (
                <li key={store.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-400 w-6">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{store.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {store.store_type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                <div className="text-xs text-stone-400">Ranked</div>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Compare Stores</h2>
        {!needsComparison ? (
          <div className="text-center py-6 bg-stone-50 rounded-2xl border border-stone-100 text-stone-500 text-sm">
            Stores are up to date.
          </div>
        ) : uniqueStores.length < 2 ? (
          <div className="text-center py-6 bg-stone-50 rounded-2xl border border-stone-100 text-stone-500 text-sm">
            Add at least two stores to compare.
          </div>
        ) : comparePair ? (
          <div className="space-y-3">
            <p className="text-xs text-stone-500 text-center">
              Do a few quick comparisons to re-rank stores.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[comparePair.left, comparePair.right].map((storeId) => {
                const store = uniqueStores.find((s) => s.id === storeId);
                if (!store) return null;
                return (
                  <button
                    key={store.id}
                    type="button"
                    disabled={compareLoading}
                    onClick={() =>
                      handleCompare(
                        store.id,
                        store.id === comparePair.left ? comparePair.right : comparePair.left
                      )
                    }
                    className="rounded-2xl border border-stone-200 bg-white p-4 text-left hover:bg-stone-50 transition disabled:opacity-60"
                  >
                    <p className="text-sm font-semibold">{store.name}</p>
                    <p className="text-xs text-stone-500 capitalize">
                      {store.store_type.replace(/_/g, " ")}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">My Updates</h2>
        {items.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100">
            <p className="text-stone-500 mb-1">No items yet.</p>
            <p className="text-xs text-stone-400">Add your first piece to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-50">
                <div className="relative aspect-square w-full bg-pastel-gray">
                  <Image
                    src={getImageUrl(item.image_path)}
                    alt="Clothing item"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-white/50">
                    <span className="font-bold text-xs text-primary">Score {item.rating}</span>
                  </div>
                </div>

                <div className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${getTagColor(item.store.store_type)}`}>
                    {item.store.store_type.replace("_", " ")}
                  </span>

                  <h3 className="font-bold text-sm text-primary truncate">{item.store.name}</h3>

                  {item.location_text && (
                    <div className="flex items-center text-muted text-[10px] mt-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{item.location_text}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
