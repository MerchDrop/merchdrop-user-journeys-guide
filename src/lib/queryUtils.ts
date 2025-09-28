import { toast } from 'sonner';

// Error handling utility for React Query
export function handleQueryError(error: any, customMessage?: string) {
  console.error('Query error:', error);
  
  let errorMessage = customMessage || 'Something went wrong. Please try again.';
  
  if (error?.message) {
    if (error.message.includes('JWT')) {
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (error.message.includes('permission')) {
      errorMessage = 'You don\'t have permission to perform this action.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection.';
    }
  }
  
  toast.error(errorMessage);
  return errorMessage;
}

// Success message utility
export function handleQuerySuccess(message: string) {
  toast.success(message);
}

// Loading state utility for optimistic updates
export function createOptimisticUpdate<T>(
  data: T[],
  updatedItem: Partial<T> & { id: string },
  operation: 'create' | 'update' | 'delete'
) {
  switch (operation) {
    case 'create':
      return [...data, updatedItem as T];
    case 'update':
      return data.map(item => 
        (item as any).id === updatedItem.id 
          ? { ...item, ...updatedItem } 
          : item
      );
    case 'delete':
      return data.filter(item => (item as any).id !== updatedItem.id);
    default:
      return data;
  }
}

// Utility to invalidate related queries
export function getInvalidationQueries(type: string, id?: string) {
  const queries = [];
  
  switch (type) {
    case 'user':
      queries.push(['users']);
      if (id) queries.push(['users', 'detail', id]);
      break;
    case 'product':
      queries.push(['products']);
      if (id) queries.push(['products', 'detail', id]);
      break;
    case 'artist':
      queries.push(['artists']);
      if (id) queries.push(['artists', 'detail', id]);
      break;
    case 'order':
      queries.push(['orders']);
      if (id) queries.push(['orders', 'detail', id]);
      break;
  }
  
  return queries;
}