import { User, Item, StoreRanking } from "./types";

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

export async function getFollowing(username: string): Promise<User[]> {
  const res = await fetch(`${API_URL}/users/${username}/following`);
  if (!res.ok) return [];
  return res.json();
}

// --- STATS ---
export async function getRankings(userId: number): Promise<StoreRanking[]> {
  const res = await fetch(`${API_URL}/store_rankings?user_id=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

// Helper to construct full image URL
export const getImageUrl = (path: string) => {
  // If backend returns "uploads/file.jpg", prepend host
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
};
