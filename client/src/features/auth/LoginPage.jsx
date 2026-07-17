import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuthStore } from '../../stores/auth.js';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';

export default function LoginPage() {
  const { token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (token) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setAuth({ token: data.token, admin: data.admin ?? null });
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ?? 'Could not sign in. Check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl/tight font-semibold tracking-tight">FashionHub</p>
          <p className="mt-2 text-sm text-ink-soft">Sign in to your admin dashboard</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6"
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@fashionhub.pk"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
