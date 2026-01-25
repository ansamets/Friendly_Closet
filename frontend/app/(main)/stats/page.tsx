"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRankings } from "@/lib/api";
import { StoreRanking } from "@/lib/types";

export default function StatsPage() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<StoreRanking[]>([]);

  useEffect(() => {
    if (user) {
      getRankings(user.id).then(setRankings);
    }
  }, [user]);

  if (!user) return <div>Please login</div>;

  return (
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
                    <p className="text-xs text-gray-500 capitalize">{store.store_type.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="font-mono text-sm text-blue-600 font-bold">
                  {Math.round(store.current_elo)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
