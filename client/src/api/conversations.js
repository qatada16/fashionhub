import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from './client.js';

export function useConversations(params = {}) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/conversations', { params });
      return data;
    },
    refetchInterval: 30000,
    placeholderData: keepPreviousData,
  });
}

export function useConversation(id) {
  return useQuery({
    queryKey: ['conversations', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/conversations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useToggleConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isOpen }) => {
      const { data } = await api.patch(`/api/admin/conversations/${id}`, { isOpen });
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['conversations', 'detail', id] });
    },
  });
}
