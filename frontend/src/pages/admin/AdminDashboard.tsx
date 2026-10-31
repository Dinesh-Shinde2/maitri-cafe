import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Calendar, PartyPopper, Users, Bell, CheckCircle2, QrCode, ArrowRight } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { reportsApi, ordersApi } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [serviceReqs, setServiceReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    reportsApi.getAnalytics('Today').then((res) => {
      setAnalytics(res.data);
    }).catch(console.error);

    ordersApi.getServiceRequests().then((res) => {
      setServiceReqs(res.data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAttendRequest = (id: number) => {
    ordersApi.attendServiceRequest(id).then(() => {
      loadData();
    }).catch(console.error);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Top Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-cafe-950">
              Good Morning 👋
            </h1>
            <p className="text-xs text-cafe-600 mt-0.5">Here is today's real-time Maitri Cafe overview.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-amber-800 bg-amber-100 font-bold px-3 py-1.5 rounded-full border border-amber-200">
              Live Systems Operational
            </span>
          </div>
        </div>

        {/* Active Service Requests Notification Alert */}
        {serviceReqs.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-400 p-5 rounded-3xl space-y-3 shadow-md animate-pulse">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <Bell className="w-5 h-5 text-amber-600" />
              <span>{serviceReqs.length} Active Table Service Alert(s)!</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {serviceReqs.map((req) => (
                <div key={req.id} className="bg-white p-3 rounded-2xl border border-amber-300 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-cafe-950 text-sm">Table {req.table_number}</span>
                    <p className="text-amber-800 font-semibold">{req.request_type} Request</p>
                  </div>
                  <button
                    onClick={() => handleAttendRequest(req.id)}
                    className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-emerald-500"
                  >
                    Mark Attended
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-amber-600">
              <span className="text-xs font-bold text-cafe-600 uppercase">Today's Sales</span>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-amber-700" />
              </div>
            </div>
            <h3 className="text-3xl font-bold font-serif text-cafe-950">
              ₹{analytics?.overview?.total_sales || 0}
            </h3>
            <p className="text-[11px] text-cafe-500">Completed & active orders today</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-blue-600">
              <span className="text-xs font-bold text-cafe-600 uppercase">Today's Orders</span>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-700" />
              </div>
            </div>
            <h3 className="text-3xl font-bold font-serif text-cafe-950">
              {analytics?.overview?.total_orders || 0}
            </h3>
            <p className="text-[11px] text-cafe-500">QR table orders processed</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-purple-600">
              <span className="text-xs font-bold text-cafe-600 uppercase">Bookings</span>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-700" />
              </div>
            </div>
            <h3 className="text-3xl font-bold font-serif text-cafe-950">
              {analytics?.bookings_summary?.total_bookings || 0}
            </h3>
            <p className="text-[11px] text-cafe-500">Table reservations made</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-pink-600">
              <span className="text-xs font-bold text-cafe-600 uppercase">Celebration Events</span>
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <PartyPopper className="w-5 h-5 text-pink-700" />
              </div>
            </div>
            <h3 className="text-3xl font-bold font-serif text-cafe-950">
              {analytics?.celebration_summary?.total_requests || 0}
            </h3>
            <p className="text-[11px] text-cafe-500">Birthdays & Party requests</p>
          </div>

        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/orders"
            className="bg-cafe-950 text-white rounded-3xl p-6 border border-cafe-800 hover:border-amber-500 transition-all shadow-lg space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-amber-200 group-hover:text-amber-400">
              Live Order Dispatcher Queue
            </h3>
            <p className="text-xs text-amber-300/80">View incoming table orders, confirm kitchen prep, and update delivery status.</p>
            <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold pt-2">
              <span>Open Orders Queue</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/admin/tables"
            className="bg-white text-cafe-950 rounded-3xl p-6 border border-amber-200 hover:border-amber-400 transition-all shadow-sm space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-cafe-950 group-hover:text-amber-700">
              Table Floor Plan & QR Codes
            </h3>
            <p className="text-xs text-cafe-600">Inspect occupied tables, view active bill amount, and print secure QR codes.</p>
            <div className="inline-flex items-center space-x-1.5 text-xs text-amber-700 font-bold pt-2">
              <span>Manage Tables & QR</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="bg-white text-cafe-950 rounded-3xl p-6 border border-amber-200 hover:border-amber-400 transition-all shadow-sm space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-cafe-950 group-hover:text-emerald-700">
              Analytics & Sales Reports
            </h3>
            <p className="text-xs text-cafe-600">Analyze date-filtered sales, top-selling dishes, and average order value.</p>
            <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 font-bold pt-2">
              <span>View Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

      </div>
    </AdminLayout>
  );
};
