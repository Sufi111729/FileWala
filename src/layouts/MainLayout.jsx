import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const Footer = lazy(() => import('../components/Footer.jsx'));

export default function MainLayout() {
  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
