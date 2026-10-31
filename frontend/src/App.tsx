import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { MenuPage } from './pages/customer/MenuPage';
import { ScanPage } from './pages/customer/ScanPage';
import { BookTablePage } from './pages/customer/BookTablePage';
import { CelebrationPage } from './pages/customer/CelebrationPage';
import { QrOrderingPage } from './pages/customer/QrOrderingPage';
import { OrderStatusPage } from './pages/customer/OrderStatusPage';
import { FeedbackPage } from './pages/customer/FeedbackPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminTablesPage } from './pages/admin/AdminTablesPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminCelebrationsPage } from './pages/admin/AdminCelebrationsPage';
import { AdminMenuPage } from './pages/admin/AdminMenuPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminLoyaltyPage } from './pages/admin/AdminLoyaltyPage';

// Protected Route Guard for Admin Panel
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col justify-between bg-paper">
            <Navbar />
            
            <div className="flex-1">
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/scan" element={<ScanPage />} />
                <Route path="/book-table" element={<BookTablePage />} />
                <Route path="/celebration" element={<CelebrationPage />} />
                <Route path="/order/:tableNumber" element={<QrOrderingPage />} />
                <Route path="/order/status/:orderId" element={<OrderStatusPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />

                {/* Secret Confidential Admin Login Route (Hidden from customers) */}
                <Route path="/admin-22" element={<AdminLoginPage />} />

                {/* Redirect generic /admin or /admin/login to home */}
                <Route path="/admin" element={<Navigate to="/" replace />} />
                <Route path="/admin/login" element={<Navigate to="/" replace />} />

                {/* Protected Admin Console Routes */}
                <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrdersPage /></AdminProtectedRoute>} />
                <Route path="/admin/tables" element={<AdminProtectedRoute><AdminTablesPage /></AdminProtectedRoute>} />
                <Route path="/admin/loyalty" element={<AdminProtectedRoute><AdminLoyaltyPage /></AdminProtectedRoute>} />
                <Route path="/admin/bookings" element={<AdminProtectedRoute><AdminBookingsPage /></AdminProtectedRoute>} />
                <Route path="/admin/celebrations" element={<AdminProtectedRoute><AdminCelebrationsPage /></AdminProtectedRoute>} />
                <Route path="/admin/menu" element={<AdminProtectedRoute><AdminMenuPage /></AdminProtectedRoute>} />
                <Route path="/admin/reports" element={<AdminProtectedRoute><AdminReportsPage /></AdminProtectedRoute>} />
                <Route path="/admin/feedback" element={<AdminProtectedRoute><AdminFeedbackPage /></AdminProtectedRoute>} />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
