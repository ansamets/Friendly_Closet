import { User, Item, StoreRanking, FollowRequest } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- AUTH ---
export async function loginOrCreate(username: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}
export async function loginWithPassword(username: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.detail || "Login failed");
  }
  return res.json();
}

// --- ITEMS (Feed) ---
export async function getFeed(): Promise<Item[]> {
  const res = await fetch(`${API_URL}/items`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

export async function getFriendsFeed(username: string): Promise<Item[]> {
  const res = await fetch(`${API_URL}/items/friends?username=${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error("Failed to fetch friends feed");
  return res.json();
}

// --- ADD ITEM (Multipart Form Data) ---
export async function createItem(formData: FormData): Promise<Item> {
  // Note: We do NOT set 'Content-Type' manually when using FormData.
  // The browser sets it to 'multipart/form-data; boundary=...' automatically.
  const res = await fetch(`${API_URL}/items`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload: ${err}`);
  }
  return res.json();
}

// --- FRIENDS ---
export async function followUser(follower: string, target: string) {
  const res = await fetch(`${API_URL}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ follower_username: follower, target_username: target }),
  });
  if (!res.ok) throw new Error("Failed to follow");
  return res.json();
}

export async function unfollowUser(follower: string, target: string) {
  const res = await fetch(`${API_URL}/unfollow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ follower_username: follower, target_username: target }),
  });
  if (!res.ok) throw new Error("Failed to unfollow");
  return res.json();
}

export async function getFollowRequests(username: string): Promise<FollowRequest[]> {
  const res = await fetch(`${API_URL}/follow_requests?username=${encodeURIComponent(username)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getSentFollowRequests(username: string): Promise<FollowRequest[]> {
  const res = await fetch(`${API_URL}/follow_requests/sent?username=${encodeURIComponent(username)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function acceptFollowRequest(requestId: number, username: string) {
  const res = await fetch(`${API_URL}/follow_requests/${requestId}/accept?username=${encodeURIComponent(username)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to accept request");
  return res.json();
}

export async function rejectFollowRequest(requestId: number, username: string) {
  const res = await fetch(`${API_URL}/follow_requests/${requestId}/reject?username=${encodeURIComponent(username)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reject request");
  return res.json();
}

export async function cancelFollowRequest(requestId: number, username: string) {
  const res = await fetch(`${API_URL}/follow_requests/${requestId}/cancel?username=${encodeURIComponent(username)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to cancel request");
  return res.json();
}

export async function getFollowing(username: string): Promise<User[]> {
  const res = await fetch(`${API_URL}/users/${username}/following`);
  if (!res.ok) return [];
  return res.json();
}

export async function getFollowers(username: string): Promise<User[]> {
  const res = await fetch(`${API_URL}/users/${username}/followers`);
  if (!res.ok) return [];
  return res.json();
}

// --- STATS ---
export async function getRankings(userId: number): Promise<StoreRanking[]> {
  const res = await fetch(`${API_URL}/store_rankings?user_id=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function compareStores(userId: number, winnerStoreId: number, loserStoreId: number) {
  const res = await fetch(`${API_URL}/compare_store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      winner_store_id: winnerStoreId,
      loser_store_id: loserStoreId,
    }),
  });
  if (!res.ok) throw new Error("Failed to compare stores");
  return res.json();
}

// Helper to construct full image URL
export const getImageUrl = (path: string) => {
  // If backend returns "uploads/file.jpg", prepend host
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
};
