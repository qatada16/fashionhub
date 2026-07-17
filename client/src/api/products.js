import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/products');
      return Array.isArray(data) ? data : data.items ?? [];
    },
  });
}
