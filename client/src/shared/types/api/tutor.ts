export interface TutorSubjectRef {
  subjectId: string;
  level: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface TutorProfile {
  _id: string;
  userId: string;
  headline?: string;
  bio?: string;
  yearsExp?: number;
  teachingStyles: string[];
  subjects: TutorSubjectRef[];
  hourlyRate: number;
  currency: string;
  location?: GeoPoint;
  mode: 'online' | 'offline' | 'hybrid';
  isVerified: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TutorListParams {
  userId?: string;
  subjectId?: string;
  level?: string;
  mode?: 'online' | 'offline' | 'hybrid';
  verified?: string | boolean;
  minRate?: number;
  maxRate?: number;
  lat?: number;
  lng?: number;
  maxDistanceKm?: number;
  page?: number;
  limit?: number;
  sort?: 'rating' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

export interface TutorListResponseMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TutorListResponse {
  items: TutorProfile[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
