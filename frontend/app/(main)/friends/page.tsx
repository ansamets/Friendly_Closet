"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { acceptFollowRequest, followUser, getFollowRequests, getFollowers, getFollowing, rejectFollowRequest, unfollowUser } from "@/lib/api";
import { FollowRequest, User } from "@/lib/types";
import Link from "next/link";

export default function FriendsPage() {
  const { user } = useAuth();

  // State
  const [targetUsername, setTargetUsername] = useState("");
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load friends on mount
  useEffect(() => {
    if (user) {
      loadFollowing();
      loadFollowers();
      loadRequests();
    }
  }, [user]);

  const loadFollowing = async () => {
    if (!user) return;
    const data = await getFollowing(user.username);
    setFollowing(data);
  };

  const loadFollowers = async () => {
    if (!user) return;
    const data = await getFollowers(user.username);
    setFollowers(data);
  };

  const loadRequests = async () => {
    if (!user) return;
    const data = await getFollowRequests(user.username);
    setRequests(data);
  };

  const handleFollow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetUsername) return;

    if (targetUsername.trim().toLowerCase() === user.username.toLowerCase()) {
      setMessage("You cannot follow yourself.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await followUser(user.username, targetUsername);
      setMessage(`Follow request sent to ${targetUsername}`);
      setTargetUsername("");
    } catch (err) {
      setMessage("Could not send request (maybe they don't exist?)");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (username: string) => {
    if (!user) return;
    await unfollowUser(user.username, username);
    setFollowing((prev) => prev.filter((f) => f.username !== username));
  };

  const handleAccept = async (requestId: number) => {
    if (!user) return;
    const accepted = requests.find((req) => req.id === requestId);
    await acceptFollowRequest(requestId, user.username);
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
    if (accepted) {
      setFollowers((prev) => {
        if (prev.some((f) => f.username === accepted.requester_username)) return prev;
        return [
          ...prev,
          { id: Date.now(), username: accepted.requester_username },
        ];
      });
    }
  };

  const handleReject = async (requestId: number) => {
    if (!user) return;
    await rejectFollowRequest(requestId, user.username);
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  if (!user) {
    return (
      <div className="text-center mt-10 space-y-3">
        <p>Please log in first.</p>
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
              <div key={f.id} className="bg-white p-3 rounded-xl border flex items-center justify-between">
                <span className="font-medium">{f.username}</span>
                <button
                  type="button"
                  onClick={() => handleUnfollow(f.username)}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Followers List */}
      <div>
        <h2 className="font-semibold mb-3">Followers</h2>
        {followers.length === 0 ? (
          <p className="text-gray-400 text-sm">No followers yet.</p>
        ) : (
          <div className="space-y-2">
            {followers.map((f) => (
              <div key={f.id} className="bg-white p-3 rounded-xl border">
                <span className="font-medium">{f.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming Requests */}
      <div>
        <h2 className="font-semibold mb-3">Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-3 rounded-xl border flex items-center justify-between">
                <span className="font-medium">{req.requester_username}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    className="bg-black text-white px-3 py-1 rounded-lg text-xs font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
