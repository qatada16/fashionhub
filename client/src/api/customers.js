import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from './client.js';

export function useCustomers(params = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/customers', { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: ['customers', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/customers/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
