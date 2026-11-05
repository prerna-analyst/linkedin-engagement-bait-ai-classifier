/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { AlertProvider } from './context/AlertContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Toast } from './components/Toast.tsx';
import { SetAlertModal } from './components/SetAlertModal.tsx';
import { Product } from './types/index.ts';

// Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { ExploreProductsPage } from './pages/ExploreProductsPage.tsx';
import { ProductDetailsPage } from './pages/ProductDetailsPage.tsx';
import { ProductComparisonPage } from './pages/ProductComparisonPage.tsx';
import { DealsPage } from './pages/DealsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { UserDashboardPage } from './pages/UserDashboardPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { PriceAlertsPage } from './pages/PriceAlertsPage.tsx';
import { PriceHistoryPage } from './pages/PriceHistoryPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { UserProfilePage } from './pages/UserProfilePage.tsx';
import { AccountSettingsPage } from './pages/AccountSettingsPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';

function MainRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [alertProduct, setAlertProduct] = useState<Product | null>(null);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract query parameters
  const getSearchParams = () => {
    const url = new URL(window.location.href);
    return {
      query: url.searchParams.get('query') || '',
      category: url.searchParams.get('category') || 'all',
      product: url.searchParams.get('product') || '',
    };
  };

  const { query, category, product: paramProductId } = getSearchParams();

  // Render appropriate view based on pathname
  const renderCurrentPage = () => {
    // 1. Product details: /products/:id
    if (currentPath.startsWith('/products/')) {
      const prodId = currentPath.replace('/products/', '');
      return (
        <ProductDetailsPage
          productId={prodId}
          navigate={navigate}
          onSetAlert={(p) => setAlertProduct(p)}
        />
      );
    }

    // 2. Explore
    if (currentPath === '/explore') {
      return (
        <ExploreProductsPage
          initialQuery={query}
          initialCategory={category}
          navigate={navigate}
          onSetAlert={(p) => setAlertProduct(p)}
        />
      );
    }

    // 3. Comparison
    if (currentPath === '/compare') {
      return (
        <ProductComparisonPage
          initialProductId={paramProductId}
          navigate={navigate}
          onSetAlert={(p) => setAlertProduct(p)}
        />
      );
    }

    // 4. Best Deals
    if (currentPath === '/deals') {
      return <DealsPage navigate={navigate} onSetAlert={(p) => setAlertProduct(p)} />;
    }

    // 5. Auth
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }

    // 6. Static / Info
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage navigate={navigate} />;
    }

    // 7. Customer Dashboard & Tools
    if (currentPath === '/dashboard') {
      return (
        <UserDashboardPage
          navigate={navigate}
          onSetAlert={(p) => setAlertProduct(p)}
        />
      );
    }
    if (currentPath === '/wishlist') {
      return (
        <WishlistPage
          navigate={navigate}
          onSetAlert={(p) => setAlertProduct(p)}
        />
      );
    }
    if (currentPath === '/alerts') {
      return (
        <PriceAlertsPage
          navigate={navigate}
          onSetAlert={(p) => setAlertProduct(p)}
        />
      );
    }
    if (currentPath === '/history') {
      return <PriceHistoryPage navigate={navigate} />;
    }
    if (currentPath === '/notifications') {
      return <NotificationsPage navigate={navigate} />;
    }
    if (currentPath === '/profile') {
      return <UserProfilePage navigate={navigate} />;
    }
    if (currentPath === '/settings') {
      return <AccountSettingsPage navigate={navigate} />;
    }

    // 8. Admin Panel
    if (currentPath.startsWith('/admin')) {
      return <AdminDashboardPage navigate={navigate} />;
    }

    // Default: Landing Page
    return <LandingPage navigate={navigate} onSetAlert={(p) => setAlertProduct(p)} />;
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex flex-col justify-between selection:bg-[#FFD43B] selection:text-black">
      <Navbar currentPath={currentPath} navigate={navigate} />

      <main className="flex-1">{renderCurrentPage()}</main>

      <Footer navigate={navigate} />

      {/* Target Price Alert Modal */}
      {alertProduct && (
        <SetAlertModal product={alertProduct} onClose={() => setAlertProduct(null)} />
      )}

      {/* Real-time Toast Alerts */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <AlertProvider>
          <NotificationProvider>
            <MainRouter />
          </NotificationProvider>
        </AlertProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
