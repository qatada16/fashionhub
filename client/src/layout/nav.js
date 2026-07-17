import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessagesSquare,
  Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/conversations', label: 'Conversations', icon: MessagesSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
];
