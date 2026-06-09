import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { lazyWithRetry } from '../utils/lazyPage.js';

const Footer = lazyWithRetry(() => import('../components/Footer.jsx'));
const ThirdPartyScripts = lazyWithRetry(() => import('../components/ThirdPartyScripts.jsx'));

function FooterReserve() {
  return <div className="site-footer footer-reserve" aria-hidden="true" />;
}

export default function MainLayout() {
  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Suspense fallback={<FooterReserve />}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <ThirdPartyScripts />
      </Suspense>
    </div>
  );
}
