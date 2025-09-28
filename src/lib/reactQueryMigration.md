# React Query Migration Guide

This guide documents the migration from legacy hooks to React Query hooks for better performance and data management.

## Migration Overview

### Before (Legacy Hooks)
```typescript
import { useUsers } from '@/hooks/useUsers';

const { users, loading, error, updateUserRole } = useUsers();
```

### After (React Query)
```typescript
import { useUsers } from '@/hooks/useUsersQuery';

const { users, loading, error, updateUserRole } = useUsers();
```

## Key Benefits

1. **Automatic Caching**: Data is cached intelligently with configurable stale times
2. **Background Refetching**: Data stays fresh automatically
3. **Optimistic Updates**: Instant UI feedback for better UX
4. **Request Deduplication**: Multiple components requesting same data = single request
5. **Real-time Subscriptions**: Live updates via Supabase subscriptions
6. **Error Handling**: Centralized error management with toast notifications
7. **Parallel Queries**: Multiple queries run concurrently when possible

## Migration Checklist

### ✅ Completed Components

**Admin Components:**
- [x] `CleanAdminUserTable` - User management with role updates
- [x] `AdminUserTable` - Basic user table
- [x] `AdminArtistTable` - Artist management
- [x] `ArtistApprovalCard` - Artist approval workflow
- [x] `ArtistOverview` - Artist statistics
- [x] `AdminOrdersStats` - Order statistics
- [x] `AdminOrdersTable` - Order management
- [x] `AnalyticsOverview` - Analytics dashboard
- [x] `AdminOverview` - Admin dashboard overview

**Shop Components:**
- [x] `MerchCategories` - Product categories
- [x] `ProductMarquee` - Product carousel
- [x] `Shop` - Main shop page
- [x] `FeaturedArtists` - Featured artists section

**Artist Components:**
- [x] `Products` - Artist product management

**Designer Components:**
- [x] `AllArtists` - Artist directory for designers
- [x] `DesignUpload` - Design upload form
- [x] `DesignerAnalytics` - Designer analytics
- [x] `DesignerDashboard` - Designer dashboard
- [x] `DesignerPayouts` - Payout management
- [x] `DesignerProfile` - Profile management
- [x] `MyDesigns` - Design portfolio

## Performance Improvements

### Before vs After

**Before (Legacy):**
- Manual state management
- No caching - refetch on every component mount
- Race conditions between multiple API calls
- No optimistic updates
- Manual error handling per component

**After (React Query):**
- Automatic state management with intelligent caching
- Background refetching keeps data fresh
- Request deduplication prevents unnecessary API calls
- Optimistic updates for instant UI feedback
- Centralized error handling with user-friendly messages
- Real-time subscriptions for live data updates

### Cache Strategy

```typescript
// Query cache configuration
queries: {
  staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
  gcTime: 10 * 60 * 1000,   // 10 minutes - cache cleanup time
  refetchOnWindowFocus: false, // Don't refetch on window focus
  refetchOnReconnect: 'always', // Always refetch on reconnect
}
```

### Real-time Features

The new implementation includes real-time subscriptions that automatically update the UI when data changes:

- **Orders**: Live updates when order status changes
- **Products**: Real-time inventory and status updates
- **Users**: Instant role and profile updates
- **Artists**: Live approval status changes
- **Designs**: Real-time design status updates

## API Compatibility

All new React Query hooks maintain backward compatibility with existing component APIs:

```typescript
// Same API as before, but powered by React Query
const { users, loading, error, updateUserRole } = useUsers();
```

## Error Handling

Centralized error handling provides consistent user feedback:

```typescript
// Automatic error handling with toast notifications
- Authentication errors: "Your session has expired. Please log in again."
- Permission errors: "You don't have permission to perform this action."
- Network errors: "Network error. Please check your connection."
- Generic errors: "Something went wrong. Please try again."
```

## Development Tools

React Query DevTools are enabled in development mode for debugging:
- View all queries and their states
- Inspect cache contents
- Trigger manual refetches
- Monitor query performance

## Next Steps

1. ✅ **Phase 1**: Core infrastructure setup (Complete)
2. ✅ **Phase 2**: Migrate all existing hooks (Complete)  
3. ✅ **Phase 3**: Update all components (Complete)
4. 🔄 **Phase 4**: Performance optimization (In Progress)
   - Implement infinite queries for large datasets
   - Add prefetching for predictable navigation
   - Optimize real-time subscriptions

## Performance Monitoring

Monitor these metrics to validate improvements:
- Page load times
- API request counts
- User interaction responsiveness
- Cache hit ratios
- Error rates

The migration is now complete and all components should benefit from improved performance, caching, and real-time capabilities.