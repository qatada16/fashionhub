import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout.jsx';
import ProtectedRoute from './features/auth/ProtectedRoute.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import LandingPage from './features/landing/LandingPage.jsx';
import NotFoundPage from './features/landing/NotFoundPage.jsx';
import ChatPage from './features/chat/ChatPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import ProductsPage from './features/products/ProductsPage.jsx';
import OrdersPage from './features/orders/OrdersPage.jsx';
import CustomersPage from './features/customers/CustomersPage.jsx';
import ConversationsPage from './features/conversations/ConversationsPage.jsx';
import SettingsPage from './features/settings/SettingsPage.jsx';
import { Toaster } from './components/Toast.jsx';

const LEGACY_PATHS = ['products', 'orders', 'customers', 'conversations', 'settings'];

export default function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        {LEGACY_PATHS.map((p) => (
          <Route key={p} path={`/${p}`} element={<Navigate to={`/dashboard/${p}`} replace />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
