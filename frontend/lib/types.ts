export interface User {
  id: number;
  username: string;
}

export interface Store {
  id: number;
  name: string;
  store_type: string;
}

// lib/types.ts

export interface User {
  id: number;
  username: string;
}

export interface Store {
  id: number;
  name: string;
  store_type: string;
}

export interface Item {
  id: number;
  user_id: number;
  store_id: number;
  image_path: string;
  location_text?: string;

  // NEW
  latitude?: number;
  longitude?: number;

  materials_text?: string;
  rating: number;
  notes?: string;
  created_at: string;
  store: {
    name: string;
    store_type: string;
  };
}

export interface StoreRanking {
  id: number;
  name: string;
  store_type: string;
  current_elo: number;
}

export interface FollowRequest {
  id: number;
  requester_username: string;
  target_username: string;
  status: string;
  created_at: string;
}

export interface StoreRanking {
  id: number;
  name: string;
  store_type: string;
  current_elo: number;
}
