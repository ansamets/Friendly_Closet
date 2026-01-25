"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { followUser, getFollowing } from "@/lib/api";
import { User } from "@/lib/types";

export default function FriendsPage() {
  const { user } = useAuth();

  // State
  const [targetUsername, setTargetUsername] = useState("");
  const [following, setFollowing] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load friends on mount
  useEffect(() => {
    if (user) {
      loadFollowing();
    }
  }, [user]);

  const loadFollowing = async () => {
    if (!user) return;
    const data = await getFollowing(user.username);
    setFollowing(data);
  };

  const handleFollow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetUsername) return;

    setLoading(true);
    setMessage("");

    try {
      await followUser(user.username, targetUsername);
      setMessage(`You are now following ${targetUsername}`);
      setTargetUsername("");
      loadFollowing(); // Refresh list
    } catch (err) {
      setMessage("Could not follow user (maybe they don't exist?)");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-4">Please log in first.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Friends</h1>

      {/* Add Friend Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="font-semibold mb-3">Find People</h2>
        <form onSubmit={handleFollow} className="flex gap-2">
          <input
            type="text"
            placeholder="Username"
            className="flex-1 p-2 border rounded-lg"
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg font-bold"
          >
            {loading ? "..." : "Follow"}
          </button>
        </form>
        {message && <p className="text-sm text-gray-500 mt-2">{message}</p>}
      </div>

      {/* Following List */}
      <div>
        <h2 className="font-semibold mb-3">Following</h2>
        {following.length === 0 ? (
          <p className="text-gray-400 text-sm">You aren't following anyone yet.</p>
        ) : (
          <div className="space-y-2">
            {following.map((f) => (
              <div key={f.id} className="bg-white p-3 rounded-xl border flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {f.username[0].toUpperCase()}
                </div>
                <span className="font-medium">{f.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
