export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  description: string;
  photo_url?: string;
  status: 'pending' | 'resolved' | 'rejected';
  timestamp: string;
  reporter?: User;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  category: 'badge' | 'discount' | 'item';
  image_url?: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  points_redeemed: number;
  reward_item: string;
  redeemed_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  timestamp: string;
  ip_address?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}