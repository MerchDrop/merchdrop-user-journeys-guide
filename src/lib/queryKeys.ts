// Query keys factory for consistent cache management
export const queryKeys = {
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    artistProducts: (artistId: string) => [...queryKeys.products.all, 'artist', artistId] as const,
  },

  // Artists
  artists: {
    all: ['artists'] as const,
    lists: () => [...queryKeys.artists.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.artists.lists(), { filters }] as const,
    details: () => [...queryKeys.artists.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.artists.details(), id] as const,
    pending: ['artists', 'pending'] as const,
    featured: (limit?: number) => ['artists', 'featured', { limit }] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.orders.lists(), { filters }] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    userOrders: (userId: string) => [...queryKeys.orders.all, 'user', userId] as const,
  },

  // Designers
  designers: {
    all: ['designers'] as const,
    profile: (userId: string) => [...queryKeys.designers.all, 'profile', userId] as const,
    designs: (designerId: string) => [...queryKeys.designers.all, 'designs', designerId] as const,
    payouts: (designerId: string) => [...queryKeys.designers.all, 'payouts', designerId] as const,
  },

  // Artist payouts
  payouts: {
    all: ['payouts'] as const,
    list: (artistId?: string) => [...queryKeys.payouts.all, 'list', artistId] as const,
  },

  // Current user's artist profile
  myArtistProfile: (userId: string) => ['myArtistProfile', userId] as const,

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    overview: ['analytics', 'overview'] as const,
    sales: (dateRange?: { start: string; end: string }) => ['analytics', 'sales', { dateRange }] as const,
  },
} as const;