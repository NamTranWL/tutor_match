export const tutorKeys = {
  all: ['tutor'] as const,
  list: (params: unknown) => ['tutor', 'list', params] as const,
  detail: (id: string) => ['tutor', 'detail', id] as const,
};

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (params: unknown) => ['bookings', 'list', params] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
};

export const usersKeys = {
  all: ['users'] as const,
  list: (params: unknown) => ['users', 'list', params] as const,
  listIncludeDeleted: (params: unknown) => ['users', 'list', 'includeDeleted', params] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export const queryKeys = {
  parentProfile: {
    all: ['parentProfile'] as const,
    byUser: (userId: string) => ['parentProfile', 'byUser', userId] as const,
    detail: (id: string) => ['parentProfile', 'detail', id] as const,
  },
};
