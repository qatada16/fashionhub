import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from './client.js';

export function useOrders(params = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/orders', { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const { data } = await api.patch(`/api/admin/orders/${id}`, body);
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['orders', 'detail', id] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
