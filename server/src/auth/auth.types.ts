export interface SafeUser {
  _id: string;
  email: string;
  role: 'parent' | 'tutor' | 'admin';
  name?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  isActive?: boolean;
}

export interface LoginResult {
  access_token: string;
  user: SafeUser;
}
