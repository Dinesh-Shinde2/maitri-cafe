import React, { useEffect, useState } from 'react';
import { PartyPopper, Check, X, PhoneCall, Cake, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { celebrationsApi } from '../../services/api';

export const AdminCelebrationsPage: React.FC = () => {
  const [celebs, setCelebs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCelebs = () => {
    celebrationsApi.getAllCelebrations().then((res) => {
      setCelebs(res.data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchCelebs();
  }, []);

  const handleUpdateStatus = (id: number, status: string) => {
    celebrationsApi.updateCelebrationStatus(id, status).then(() => {
      fetchCelebs();
    }).catch(console.error);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-200 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-cafe-950">
              Birthday & Celebration Party Enquiries
            </h1>
            <p className="text-xs text-cafe-600 mt-0.5">Manage party bookings, decor & cake customizations requested by guests.</p>
          </div>
          <button
            onClick={fetchCelebs}
            className="flex items-center space-x-1.5 text-xs bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-300 font-bold px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Celebration Request Cards */}
        {loading ? (
          <div className="py-12 text-center text-pink-700">Loading party requests...</div>
        ) : celebs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-cafe-500 border border-pink-200">
            No celebration requests submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {celebs.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl p-6 border-2 border-pink-200 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-pink-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-pink-700 uppercase bg-pink-100 px-2 py-0.5 rounded">
                        {c.booking_reference}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-cafe-950 mt-1">{c.event_type}</h3>
                      <p className="text-xs text-cafe-600 font-semibold">Guest: {c.customer_name} ({c.customer_phone})</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === 'Accepted' ? 'bg-emerald-100 text-emerald-900' :
                      c.status === 'Contacted' ? 'bg-blue-100 text-blue-900' :
                      c.status === 'Rejected' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                      <p className="text-[10px] text-pink-700 font-bold uppercase">Date & Time</p>
                      <p className="font-bold text-cafe-900">{c.event_date} @ {c.event_time}</p>
                    </div>
                    <div className="bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                      <p className="text-[10px] text-pink-700 font-bold uppercase">Guests & Package</p>
                      <p className="font-bold text-cafe-900">{c.guest_count} People ({c.food_package})</p>
                    </div>
                  </div>

                  {/* Decor & Cake checkboxes */}
                  <div className="flex space-x-3 text-xs font-bold text-pink-900 bg-pink-50 p-3 rounded-2xl">
                    <span>Balloon Decor: {c.decor_required ? 'Yes 🎈' : 'No'}</span>
                    <span>•</span>
                    <span>Custom Cake: {c.cake_required ? 'Yes 🎂' : 'No'}</span>
                  </div>

                  {c.special_requests && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Special Instructions / Cake Note:</strong> "{c.special_requests}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-pink-100 pt-4 flex gap-2 text-xs">
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'Accepted')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Event</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(c.id, 'Contacted')}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Contacted</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(c.id, 'Rejected')}
                    className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-3 py-2.5 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
