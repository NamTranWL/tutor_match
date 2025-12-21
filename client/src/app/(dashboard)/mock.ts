// Dashboard API client — replaces temporary mocks with real backend calls.
// The exported types remain the same shape used by the dashboard UI.
export type Tutor = {
  id: string;
  name?: string;
  email?: string;
  rating?: number;
  subjects?: string[];
  active?: boolean;
};

export type Parent = {
  id: string;
  name?: string;
  email?: string;
  childrenCount?: number;
};

export type Booking = {
  id: string;
  parentName?: string;
  tutorName?: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount: number;
};

export type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  date: string;
  method?: string;
  status?: 'paid' | 'refunded' | 'failed';
};

export type Review = {
  id: string;
  tutorName?: string;
  parentName?: string;
  rating: number;
  comment?: string;
  date?: string;
};

const BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  : 'http://localhost:8080/api/v1';

import { auth } from '../../auth';

async function apiGet<T>(path: string): Promise<T> {
  // When running on the server (App Router server components) attach
  // the NextAuth access token as a Bearer header. Keep client-side
  // requests unchanged (they rely on cookies).
  let headers: Record<string, string> = {};
  if (typeof window === 'undefined') {
    try {
      const session = await auth();
      const token = session?.user?.access_token;
      if (token) headers['authorization'] = `Bearer ${token}`;
    } catch (e) {
      // ignore — proceed without auth header
    }
  }

  const res = await fetch(`${BASE}${path}`, { credentials: 'include', headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API GET ${path} failed: ${res.status} ${txt}`);
  }
  return (await res.json()) as T;
}

// Helper to read wrapped results { results, totalPages } or raw arrays
function unwrapResults<T>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (payload.results && Array.isArray(payload.results)) return payload.results as T[];
  return [];
}

export async function fetchBookings(): Promise<Booking[]> {
  const payload = await apiGet<any>('/bookings');
  const items = unwrapResults<any>(payload);

  // collect unique profile ids
  const parentIds = Array.from(new Set(items.map((i) => String(i.parentProfileId))));
  const tutorIds = Array.from(new Set(items.map((i) => String(i.tutorProfileId))));

  const parentMap = new Map<string, any>();
  await Promise.all(
    parentIds.map(async (id) => {
      try {
        const p = await apiGet<any>(`/parent-profiles/${id}`);
        parentMap.set(id, p);
      } catch (e) {
        // ignore missing
      }
    }),
  );

  const tutorMap = new Map<string, any>();
  await Promise.all(
    tutorIds.map(async (id) => {
      try {
        const t = await apiGet<any>(`/tutor/${id}`);
        tutorMap.set(id, t);
      } catch (e) {
        // ignore
      }
    }),
  );

  // For tutor names we may need to fetch user records
  const userIdsToFetch = Array.from(
    new Set(
      Array.from(tutorMap.values())
        .map((t: any) => (t?.userId ? String(t.userId) : null))
        .filter(Boolean),
    ),
  );
  const userMap = new Map<string, any>();
  await Promise.all(
    userIdsToFetch.map(async (uid) => {
      try {
        const idStr = String(uid);
        const users = await apiGet<any>(`/users?_id=${idStr}`);
        const list = unwrapResults<any>(users);
        if (list.length) userMap.set(idStr, list[0]);
      } catch (e) {}
    }),
  );

  return items.map((b: any) => {
    const parent = parentMap.get(String(b.parentProfileId));
    const tutor = tutorMap.get(String(b.tutorProfileId));
    let tutorName = tutor?.headline || undefined;
    if (tutor?.userId && userMap.has(String(tutor.userId))) {
      tutorName = userMap.get(String(tutor.userId)).name || tutorName;
    }
    const parentName = parent?.fullName || undefined;
    return {
      id: String(b._id || b.id),
      parentName,
      tutorName,
      date: new Date(b.date).toISOString(),
      status: b.status,
      amount: b.amount,
    };
  });
}

export async function fetchPayments(): Promise<Payment[]> {
  const payload = await apiGet<any>('/payments');
  const items = unwrapResults<any>(payload);
  return items.map((p: any) => ({
    id: String(p._id || p.id),
    bookingId: String(p.bookingId),
    amount: p.amount,
    date: new Date(p.date).toISOString(),
    method: p.method,
    status: p.status,
  }));
}

export async function fetchReviews(): Promise<Review[]> {
  const payload = await apiGet<any>('/reviews');
  const items = unwrapResults<any>(payload);

  // collect profile ids
  const parentIds = Array.from(new Set(items.map((i) => String(i.parentProfileId))));
  const tutorIds = Array.from(new Set(items.map((i) => String(i.tutorProfileId))));

  const parentMap = new Map<string, any>();
  await Promise.all(
    parentIds.map(async (id) => {
      try {
        const p = await apiGet<any>(`/parent-profiles/${id}`);
        parentMap.set(id, p);
      } catch (e) {}
    }),
  );
  const tutorMap = new Map<string, any>();
  await Promise.all(
    tutorIds.map(async (id) => {
      try {
        const t = await apiGet<any>(`/tutor/${id}`);
        tutorMap.set(id, t);
      } catch (e) {}
    }),
  );

  // fetch tutor users
  const userIds = Array.from(
    new Set(
      Array.from(tutorMap.values())
        .map((t: any) => (t?.userId ? String(t.userId) : null))
        .filter(Boolean),
    ),
  );
  const userMap = new Map<string, any>();
  await Promise.all(
    userIds.map(async (uid) => {
        try {
          const idStr = String(uid);
          const users = await apiGet<any>(`/users?_id=${idStr}`);
          const list = unwrapResults<any>(users);
          if (list.length) userMap.set(idStr, list[0]);
        } catch (e) {}
      }),
  );

  return items.map((r: any) => {
    const parent = parentMap.get(String(r.parentProfileId));
    const tutor = tutorMap.get(String(r.tutorProfileId));
    let tutorName = tutor?.headline || undefined;
    if (tutor?.userId && userMap.has(String(tutor.userId))) {
      tutorName = userMap.get(String(tutor.userId)).name || tutorName;
    }
    const parentName = parent?.fullName || undefined;
    return {
      id: String(r._id || r.id),
      tutorName,
      parentName,
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt || r.date,
    };
  });
}

export async function fetchTutors(): Promise<Tutor[]> {
  // Try to fetch tutor profiles, fallback to users with role=tutor
  try {
    const payload = await apiGet<any>('/tutor?limit=100');
    const items = unwrapResults<any>(payload);
    // map to frontend Tutor type
    const userIds = Array.from(new Set(items.map((i) => String(i.userId)).filter(Boolean)));
    const userMap = new Map<string, any>();
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const users = await apiGet<any>(`/users?_id=${uid}`);
          const list = unwrapResults<any>(users);
          if (list.length) userMap.set(uid, list[0]);
        } catch (e) {}
      }),
    );
    return items.map((t: any) => ({
      id: String(t._id || t.id),
      name: userMap.get(String(t.userId))?.name || t.headline || undefined,
      email: userMap.get(String(t.userId))?.email || undefined,
      rating: t.ratingAvg ?? t.rating ?? undefined,
      subjects: (t.subjects || []).map((s: any) => String(s.subjectId || s)),
      active: t.isVerified ?? undefined,
    }));
  } catch (err) {
    // fallback: try users endpoint
    const users = await apiGet<any>('/users?role=tutor');
    const list = unwrapResults<any>(users);
    return list.map((u: any) => ({ id: String(u._id || u.id), name: u.name, email: u.email }));
  }
}

export async function fetchParents(): Promise<Parent[]> {
  // Use users endpoint to list parents and then augment with childrenCount
  const payload = await apiGet<any>('/users?role=parent&limit=100');
  const users = unwrapResults<any>(payload);
  return Promise.all(
    users.map(async (u: any) => {
      let childrenCount = 0;
      try {
        const p = await apiGet<any>(`/parent-profiles/by-user/${String(u._id)}`);
        const profile = p;
        if (profile && profile._id) {
          const students = await apiGet<any>(`/student-profiles/by-parent/${String(profile._id)}`);
          const list = unwrapResults<any>(students);
          childrenCount = list.length;
        }
      } catch (e) {
        // ignore
      }
      return { id: String(u._id || u.id), name: u.name, email: u.email, childrenCount };
    }),
  );
}

export async function fetchStats(): Promise<{ tutors: number; parents: number; bookings: number; revenue: number }> {
  // Try dedicated stats endpoint first
  try {
    const stats = await apiGet<any>('/dashboard/stats');
    return { tutors: stats.tutors || 0, parents: stats.parents || 0, bookings: stats.bookings || 0, revenue: stats.revenue || 0 };
  } catch (e) {
    // Fallback: aggregate counts client-side
    const [tutors, parents, bookings, payments] = await Promise.all([
      (async () => {
        try {
          const res = await apiGet<any>('/tutor?limit=1');
          const list = unwrapResults<any>(res);
          return Number(res.totalPages ? res.totalPages * 1 : list.length) || list.length;
        } catch (e) {
          try {
            const res = await apiGet<any>('/users?role=tutor');
            const list = unwrapResults<any>(res);
            return list.length;
          } catch (e) {
            return 0;
          }
        }
      })(),
      (async () => {
        try {
          const res = await apiGet<any>('/users?role=parent');
          const list = unwrapResults<any>(res);
          return list.length;
        } catch (e) {
          return 0;
        }
      })(),
      (async () => {
        try {
          const res = await apiGet<any>('/bookings');
          const list = unwrapResults<any>(res);
          return list.length;
        } catch (e) {
          return 0;
        }
      })(),
      (async () => {
        try {
          const res = await apiGet<any>('/payments');
          const list = unwrapResults<any>(res);
          return list.reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
        } catch (e) {
          return 0;
        }
      })(),
    ]);
    return { tutors, parents, bookings, revenue: payments };
  }
}
