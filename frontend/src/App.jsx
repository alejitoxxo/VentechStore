// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { SettingsProvider } from './hooks/useSettings';

// Public pages
import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import ProductPage from './pages/public/ProductPage';
import CategoriesPage from './pages/public/CategoriesPage';
import CartPage from './pages/public/CartPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminImportPage from './pages/admin/AdminImportPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Public layout
import PublicLayout from './components/layout/PublicLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '12px' },
                success: { iconTheme: { primary: '#2563EB', secondary: '#fff' } },
              }}
            />
            <Routes>
              {/* Public */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalogo" element={<CatalogPage />} />
                <Route path="/catalogo/:slug" element={<CatalogPage />} />
                <Route path="/producto/:id" element={<ProductPage />} />
                <Route path="/categorias" element={<CategoriesPage />} />
                <Route path="/consulta" element={<CartPage />} />
              </Route>

              {/* Admin */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="productos" element={<AdminProductsPage />} />
                <Route path="productos/nuevo" element={<AdminProductFormPage />} />
                <Route path="productos/:id/editar" element={<AdminProductFormPage />} />
                <Route path="categorias" element={<AdminCategoriesPage />} />
                <Route path="importar" element={<AdminImportPage />} />
                <Route path="configuracion" element={<AdminSettingsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
