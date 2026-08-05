import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { HomePage } from '@/pages/store/HomePage';
import { ShopPage } from '@/pages/store/ShopPage';
import { ArtistsPage } from '@/pages/store/ArtistsPage';
import { ProductDetailPage } from '@/pages/store/ProductDetailPage';
import { SellerDetailPage } from '@/pages/store/SellerDetailPage';
import { CartPage } from '@/pages/store/CartPage';
import { CheckoutPage } from '@/pages/store/CheckoutPage';
import { OrderSuccessPage } from '@/pages/store/OrderSuccessPage';
import { EventPage } from '@/pages/store/EventPage';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminProductCreatePage } from '@/pages/admin/AdminProductCreatePage';
import { AdminProductEditPage } from '@/pages/admin/AdminProductEditPage';
import { AdminSellersPage } from '@/pages/admin/AdminSellersPage';
import { AdminSellerCreatePage } from '@/pages/admin/AdminSellerCreatePage';
import { AdminSellerEditPage } from '@/pages/admin/AdminSellerEditPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminCustomerCreatePage } from '@/pages/admin/AdminCustomerCreatePage';
import { AdminCustomerEditPage } from '@/pages/admin/AdminCustomerEditPage';
import { AdminCustomerDetailPage } from '@/pages/admin/AdminCustomerDetailPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderCreatePage } from '@/pages/admin/AdminOrderCreatePage';
import { AdminEventPage } from '@/pages/admin/AdminEventPage';

const StoreLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background font-sans text-ink antialiased">
    <PublicNavbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <PublicFooter />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (user?.role !== 'admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas da Loja Coisart */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/proxima-feira" element={<EventPage />} />
          <Route path="/artesaos" element={<ArtistsPage />} />
          <Route path="/loja" element={<ShopPage />} />
          <Route path="/produto/:slug" element={<ProductDetailPage />} />
          <Route path="/banca/:slug" element={<SellerDetailPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/encomenda-confirmada/:id" element={<OrderSuccessPage />} />
          <Route path="/sucesso/:id" element={<OrderSuccessPage />} />
        </Route>

        {/* Login e Backoffice Admin/Vendedor */}
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="produtos" element={<AdminProductsPage />} />
          <Route path="produtos/novo" element={<AdminProductCreatePage />} />
          <Route path="produtos/editar/:id" element={<AdminProductEditPage />} />
          <Route path="vendedores" element={<AdminOnlyRoute><AdminSellersPage /></AdminOnlyRoute>} />
          <Route path="vendedores/novo" element={<AdminOnlyRoute><AdminSellerCreatePage /></AdminOnlyRoute>} />
          <Route path="vendedores/editar/:id" element={<AdminOnlyRoute><AdminSellerEditPage /></AdminOnlyRoute>} />
          <Route path="categorias" element={<AdminOnlyRoute><AdminCategoriesPage /></AdminOnlyRoute>} />
          <Route path="evento" element={<AdminOnlyRoute><AdminEventPage /></AdminOnlyRoute>} />
          <Route path="clientes" element={<AdminCustomersPage />} />
          <Route path="clientes/novo" element={<AdminCustomerCreatePage />} />
          <Route path="clientes/editar/:email" element={<AdminCustomerEditPage />} />
          <Route path="clientes/:email" element={<AdminCustomerDetailPage />} />
          <Route path="encomendas" element={<AdminOrdersPage />} />
          <Route path="encomendas/nova" element={<AdminOrderCreatePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
