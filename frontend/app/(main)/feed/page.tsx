"use client";
import { useEffect, useState } from "react";
import { getFriendsFeed, getImageUrl } from "@/lib/api";
import { Item } from "@/lib/types";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function FeedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getFriendsFeed(user.username)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [user]);

  // Helper to pick pastel colors based on store type
  const getTagColor = (type: string) => {
    if (type.includes("luxury")) return "bg-pastel-purple text-purple-700";
    if (type.includes("thrift")) return "bg-pastel-green text-green-700";
    if (type.includes("boutique")) return "bg-pastel-pink text-pink-700";
    return "bg-pastel-blue text-blue-700";
  };

  if (loading) return <div className="p-8 text-center text-muted animate-pulse">Curating feed...</div>;

  return (
    <div className="space-y-8">
      <header className="px-2 pt-2">
        <h1 className="text-3xl font-light text-primary tracking-tight">
          Friends <span className="font-bold">Feed</span>
        </h1>
        <p className="text-muted text-sm mt-1">See what your friends are sharing.</p>
      </header>

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
                <span className="font-bold text-xs text-primary">★ {item.rating}</span>
              </div>
            </div>

            <div className="p-4">
              {/* Pastel Category Tag */}
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

      {items.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <p>No friends’ items yet.</p>
        </div>
      )}
    </div>
  );
}
