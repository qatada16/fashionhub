import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar, BottomBar } from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import PageTransition from './PageTransition.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

export default function DashboardLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="pb-16 sm:pb-0 sm:pl-16 lg:pl-60">
        <Topbar />
        <main className="mx-auto max-w-screen-2xl p-6">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <ErrorBoundary resetKey={location.pathname}>
                <Outlet />
              </ErrorBoundary>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
