export enum UserRole {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string; // رابط الصورة (Blob URL)
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  createdAt: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, profilePicture?: File) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}