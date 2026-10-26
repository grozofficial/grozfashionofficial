/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { useDocumentHead } from './hooks/useDocumentHead';

const AppContent: React.FC = () => {
  const { route, language } = useApp();

  useDocumentHead(route, language);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-red-600 selection:text-white bg-groz-main text-groz-main transition-colors">
      <Header />
      <motion.main
        key={route}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1"
      >
        {route === 'home' && <HomePage />}
        {route === 'shop' && <ShopPage />}
        {route === 'cart' && <CartPage />}
        {route === 'checkout' && <CheckoutPage />}
        {route === 'about' && <AboutPage />}
        {route === 'contact' && <ContactPage />}
        {route === 'admin' && <AdminPage />}
      </motion.main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
