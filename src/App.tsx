import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const CallbackPage = lazy(() => import('./pages/auth/CallbackPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
                <Route path="/products/:category" element={<Layout><ProductsPage /></Layout>} />
                <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />
                <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                <Route path="/login" element={<Layout><LoginPage /></Layout>} />
                <Route path="/signup" element={<Layout><SignUpPage /></Layout>} />
                
                {/* Auth callback routes */}
                <Route path="/auth/callback" element={<CallbackPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                
                {/* Protected routes */}
                <Route 
                  path="/checkout" 
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/account" 
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />
                <Route 
                  path="/wishlist" 
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    </Layout>
                  } 
                />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
              </Routes>
            </Suspense>
            <Toaster position="top-center" />
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;