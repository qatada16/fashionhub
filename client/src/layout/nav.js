import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessagesSquare,
  Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/products', label: 'Products', icon: ShoppingBag },
  { to: '/dashboard/orders', label: 'Orders', icon: Package },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/conversations', label: 'Conversations', icon: MessagesSquare },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];
