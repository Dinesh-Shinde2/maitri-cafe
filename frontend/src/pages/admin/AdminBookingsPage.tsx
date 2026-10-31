import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Users, RefreshCw, XCircle } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { bookingsApi } from '../../services/api';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = () => {
    bookingsApi.getAllTableBookings(statusFilter || undefined).then((res) => {
      setBookings(res.data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleUpdateStatus = (id: number, status: string) => {
    bookingsApi.updateTableBookingStatus(id, status).then(() => {
      fetchBookings();
    }).catch(console.error);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-cafe-950">
              Table Reservations Manager
            </h1>
            <p className="text-xs text-cafe-600 mt-0.5">Manage customer table bookings and seating assignments.</p>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center space-x-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex space-x-2">
          {['', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                statusFilter === st
                  ? 'bg-cafe-950 text-amber-300 shadow-md'
                  : 'bg-white text-cafe-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {st === '' ? 'All Bookings' : st}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="py-12 text-center text-amber-700">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-cafe-500 border border-amber-200">
            No bookings found.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-cafe-950">
                <thead className="bg-cafe-950 text-amber-200 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Ref ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4">Seating Pref</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-4 font-bold text-amber-900">{b.booking_reference}</td>
                      <td className="p-4 font-bold">{b.customer_name}</td>
                      <td className="p-4 text-cafe-700">{b.customer_phone}</td>
                      <td className="p-4">{b.booking_date} at {b.booking_time}</td>
                      <td className="p-4 font-bold">{b.guest_count} Guests</td>
                      <td className="p-4 text-amber-800 font-semibold">{b.seating_preference}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-900' :
                          b.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {b.status === 'Confirmed' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'Completed')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg"
                            >
                              Mark Seated & Completed
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[10px] px-2.5 py-1 rounded-lg"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
