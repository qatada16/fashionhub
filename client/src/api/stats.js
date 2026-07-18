import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/stats');
      return data;
    },
  });
}
