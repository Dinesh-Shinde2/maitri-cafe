import React, { useEffect, useState } from 'react';
import { BarChart3, IndianRupee, ShoppingBag, Calendar, PartyPopper, RefreshCw, Trophy, Grid } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { reportsApi } from '../../services/api';

export const AdminReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('Today');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    reportsApi.getAnalytics(period).then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-cafe-950">
              Cafe Analytics & Business Reports
            </h1>
            <p className="text-xs text-cafe-600 mt-0.5">Filter sales, top dishes, table revenue, and booking performance.</p>
          </div>
          <button
            onClick={fetchReports}
            className="flex items-center space-x-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Reports</span>
          </button>
        </div>

        {/* Date Filter Bar */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {['Today', 'Yesterday', 'This Week', 'This Month', 'All'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                period === p
                  ? 'bg-cafe-950 text-amber-300 shadow-md'
                  : 'bg-white text-cafe-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-amber-700">Generating analytical reports...</div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. Sales & Revenue Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-amber-600">
                  <span className="text-xs font-bold text-cafe-600 uppercase">Total Sales Revenue</span>
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-amber-700" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-serif text-cafe-950">
                  ₹{data?.overview?.total_sales || 0}
                </h3>
                <p className="text-[11px] text-cafe-500">Period: {period}</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-blue-600">
                  <span className="text-xs font-bold text-cafe-600 uppercase">Total Orders</span>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-serif text-cafe-950">
                  {data?.overview?.total_orders || 0}
                </h3>
                <p className="text-[11px] text-cafe-500">Orders completed</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-xs font-bold text-cafe-600 uppercase">Average Order Value</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-serif text-cafe-950">
                  ₹{data?.overview?.avg_order_value || 0}
                </h3>
                <p className="text-[11px] text-cafe-500">Per table order average</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-rose-600">
                  <span className="text-xs font-bold text-cafe-600 uppercase">Cancelled Orders</span>
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-rose-700" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-serif text-cafe-950">
                  {data?.overview?.cancelled_orders || 0}
                </h3>
                <p className="text-[11px] text-cafe-500">Rejected or cancelled</p>
              </div>

            </div>

            {/* 2. Top Food Items Report */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 text-amber-700">
                <Trophy className="w-6 h-6" />
                <h2 className="font-serif text-xl font-bold text-cafe-950">Top Selling Food & Beverages</h2>
              </div>

              {data?.top_food_items?.length === 0 ? (
                <p className="text-xs text-cafe-500">No food sales recorded in this period.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data?.top_food_items?.map((item: any, idx: number) => (
                    <div key={item.item_name} className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                        #{idx + 1} Best Seller
                      </span>
                      <h3 className="font-bold text-cafe-950 text-sm mt-1">{item.item_name}</h3>
                      <p className="text-xs text-cafe-600">{item.orders_count} orders placed</p>
                      <p className="font-bold text-amber-900 text-sm">Revenue: ₹{item.revenue}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Table Performance Report */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 text-amber-700">
                <Grid className="w-6 h-6" />
                <h2 className="font-serif text-xl font-bold text-cafe-950">Table Revenue & Occupancy Report</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-cafe-950">
                  <thead className="bg-cafe-950 text-amber-200 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5">Table Number</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Capacity</th>
                      <th className="p-3.5">Orders Processed</th>
                      <th className="p-3.5">Total Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {data?.table_reports?.map((tr: any) => (
                      <tr key={tr.table_number} className="hover:bg-amber-50/50">
                        <td className="p-3.5 font-bold text-amber-900">{tr.table_number}</td>
                        <td className="p-3.5">{tr.location}</td>
                        <td className="p-3.5">{tr.capacity} Guests</td>
                        <td className="p-3.5 font-bold">{tr.orders_count} Orders</td>
                        <td className="p-3.5 font-bold text-emerald-800">₹{tr.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
};
