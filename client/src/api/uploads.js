import { api } from './client.js';

export async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post('/api/admin/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
