// src/components/layout/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../public/Navbar';
import Footer from '../public/Footer';
import WhatsAppFloat from '../public/WhatsAppFloat';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
