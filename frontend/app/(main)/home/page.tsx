"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRankings, getFeed, getImageUrl } from "@/lib/api"; // Added getFeed
import { StoreRanking, Item } from "@/lib/types"; // Added Item
import { Trophy, MapPin } from "lucide-react";
import Image from "next/image";

// DYNAMIC IMPORT FOR MAP (Critical step)
import dynamic from "next/dynamic";
const MapWithNoSSR = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-stone-100 animate-pulse rounded-2xl text-center pt-24 text-muted">Loading Map...</div>
});

export default function HomePage() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<StoreRanking[]>([]);
  const [items, setItems] = useState<Item[]>([]); // New state for map pins
  const [loading, setLoading] = useState(true);

  const getTagColor = (type: string) => {
    if (type.includes("luxury")) return "bg-pastel-purple text-purple-700";
    if (type.includes("thrift")) return "bg-pastel-green text-green-700";
    if (type.includes("boutique")) return "bg-pastel-pink text-pink-700";
    return "bg-pastel-blue text-blue-700";
  };

  useEffect(() => {
    if (user) {
      // Load both Rankings AND User Items (for the map)
      Promise.all([
        getRankings(user.id),
        getFeed() // Note: ideally we'd filter this to just "my" items, but feed works for now
      ]).then(([rankData, feedData]) => {
        setRankings(rankData);
        // Filter feed to only show MY items on the map
        setItems(feedData.filter(i => i.user_id === user.id));
      }).finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return <div className="text-center mt-10">Please log in.</div>;

  return (
    <div className="space-y-8">
      <div className="text-center border-b pb-4 border-stone-200">
        <h1 className="text-3xl font-light tracking-tight text-primary">My <span className="font-bold">Map</span></h1>
      </div>

      {/* THE MAP SECTION */}
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

      <div>
        <h2 className="text-xl font-bold mb-4 px-2">My Items</h2>
        {items.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100">
            <p className="text-stone-500 mb-1">No items yet.</p>
            <p className="text-xs text-stone-400">Add your first piece to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-50">
                <div className="relative aspect-[4/5] w-full bg-pastel-gray">
                  <Image
                    src={getImageUrl(item.image_path)}
                    alt="Clothing item"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-white/50">
                    <span className="font-bold text-xs text-primary">ミ. {item.rating}</span>
                  </div>
                </div>

                <div className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${getTagColor(item.store.store_type)}`}>
                    {item.store.store_type.replace("_", " ")}
                  </span>

                  <h3 className="font-bold text-sm text-primary truncate">
                    {item.store.name}
                  </h3>

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

      {/* THE RANKINGS SECTION */}
      <div>
        <h2 className="text-xl font-bold mb-4 px-2">Top Stores</h2>
        {/* ... (Your existing Rankings code goes here) ... */}
         {/* Copy the rankings map code from previous step here */}
      </div>
    </div>
  );
}
