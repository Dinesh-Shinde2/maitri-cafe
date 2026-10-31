import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  Calendar,
  PartyPopper,
  UtensilsCrossed,
  BarChart3,
  MessageSquare,
  LogOut,
  Bell,
  Droplets,
  UserCheck,
  Receipt,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Live orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Tables & QR', path: '/admin/tables', icon: Grid },
  { label: 'Loyalty', path: '/admin/loyalty', icon: Award },
  { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
  { label: 'Celebrations', path: '/admin/celebrations', icon: PartyPopper },
  { label: 'Menu', path: '/admin/menu', icon: UtensilsCrossed },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [serviceReqs, setServiceReqs] = useState<any[]>([]);

  const fetchServiceRequests = () => {
    ordersApi.getServiceRequests().then((res) => setServiceReqs(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchServiceRequests();
    const interval = setInterval(fetchServiceRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAttendRequest = (id: number) => {
    ordersApi.attendServiceRequest(id).then(fetchServiceRequests).catch(console.error);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-22');
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper md:flex-row">
      <aside className="w-full shrink-0 border-r border-ink/10 bg-ink text-paper md:w-60">
        <div className="border-b border-paper/10 px-5 py-5">
          <p className="font-display text-lg font-bold">Maitri</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-moss-300">Admin</p>
        </div>

        <nav className="space-y-0.5 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-semibold transition ${
                  active ? 'bg-moss-600 text-paper' : 'text-paper/70 hover:bg-paper/5 hover:text-paper'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </span>
                {item.path === '/admin/orders' && serviceReqs.length > 0 && (
                  <span className="bg-copper px-1.5 py-0.5 text-[10px] font-bold text-paper">
                    {serviceReqs.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-paper/10 p-4">
          <p className="text-xs font-semibold text-paper">{user?.fullName || 'Manager'}</p>
          <p className="text-[10px] text-paper/50">Administrator</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-paper/15 px-3 py-2 text-xs font-semibold text-paper/80 hover:border-copper hover:text-copper"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-8">
        {serviceReqs.length > 0 && (
          <div className="border border-copper/40 bg-ink p-4 text-paper">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Bell className="h-4 w-4 text-copper-soft" />
              {serviceReqs.length} table call{serviceReqs.length > 1 ? 's' : ''} pending
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {serviceReqs.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-2 border border-paper/15 bg-paper/5 px-3 py-2.5 text-xs">
                  <div>
                    <p className="font-semibold">Table {req.table_number}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-paper/70">
                      {req.request_type === 'Water' && <Droplets className="h-3.5 w-3.5" />}
                      {req.request_type === 'Waiter' && <UserCheck className="h-3.5 w-3.5" />}
                      {req.request_type === 'Bill' && <Receipt className="h-3.5 w-3.5" />}
                      {req.request_type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAttendRequest(req.id)}
                    className="bg-moss-500 px-2.5 py-1.5 text-[10px] font-bold text-paper hover:bg-moss-400"
                  >
                    Attended
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};
