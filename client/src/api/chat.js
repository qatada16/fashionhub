import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './client.js';

export function useChatHistory(sessionId) {
  return useQuery({
    queryKey: ['chat-history', sessionId],
    queryFn: async () => (await api.get(`/api/chat/${sessionId}/history`)).data,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useSendChatMessage() {
  return useMutation({
    mutationFn: async ({ sessionId, message }) =>
      (await api.post('/api/chat', { sessionId, message })).data,
  });
}
