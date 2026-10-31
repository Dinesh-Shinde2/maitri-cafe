import React, { useEffect, useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, ChefHat, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { ordersApi } from '../../services/api';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    ordersApi.getAllOrders(activeTab).then((res) => {
      setOrders(res.data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    ordersApi.updateOrderStatus(orderId, newStatus).then(() => {
      fetchOrders();
    }).catch(console.error);
  };

  const statusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'Received': return <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 rounded-full text-xs">Pending Approval</span>;
      case 'Confirmed': return <span className="bg-blue-100 text-blue-900 border border-blue-300 font-bold px-3 py-1 rounded-full text-xs">Order Confirmed</span>;
      case 'Preparing': return <span className="bg-purple-100 text-purple-900 border border-purple-300 font-bold px-3 py-1 rounded-full text-xs">Kitchen Prep</span>;
      case 'Ready': return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-3 py-1 rounded-full text-xs">Ready to Serve</span>;
      case 'Delivered': return <span className="bg-gray-100 text-gray-800 border border-gray-300 font-bold px-3 py-1 rounded-full text-xs">Delivered</span>;
      case 'Cancelled': return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-3 py-1 rounded-full text-xs">Cancelled</span>;
      default: return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-cafe-950">
              Live Order Management Queue
            </h1>
            <p className="text-xs text-cafe-600 mt-0.5">Confirm customer table orders and update kitchen preparation status.</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Tabbed Status Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {['All', 'Received', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-cafe-950 text-amber-300 shadow-md'
                  : 'bg-white text-cafe-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {tab === 'Received' ? 'Pending Approval' : tab}
            </button>
          ))}
        </div>

        {/* Orders List Grid */}
        {loading ? (
          <div className="py-12 text-center text-amber-700">Fetching live orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-cafe-500 border border-amber-200 space-y-2">
            <ShoppingBag className="w-12 h-12 text-amber-300 mx-auto" />
            <h3 className="font-bold text-cafe-900 text-lg">No Orders in this Status</h3>
            <p className="text-xs">When customers scan table QR codes and order food, their orders will appear here live.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase">Order {order.order_number}</span>
                      <h3 className="font-serif text-2xl font-bold text-cafe-950">Table {order.table_number}</h3>
                      <p className="text-xs text-cafe-600 font-medium">Guest: {order.customer_name}</p>
                    </div>
                    <div>{statusBadge(order.order_status)}</div>
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="space-y-2 py-4">
                    <h4 className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Ordered Items</h4>
                    <div className="space-y-1 bg-cafe-50 p-3 rounded-2xl border border-amber-100 text-xs">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between font-medium">
                          <span className="text-cafe-950 font-bold">{item.item_name} × {item.quantity}</span>
                          <span className="text-amber-900 font-bold">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                        <strong>Kitchen Note:</strong> "{order.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Total & Action Status Transition Buttons */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-xs font-bold text-cafe-600">Total Amount:</span>
                    <span className="font-bold text-xl text-amber-900">₹{order.total_amount}</span>
                  </div>

                  {/* Status Change Buttons */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {order.order_status === 'Received' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Confirmed')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1 col-span-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm Order</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1 col-span-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {order.order_status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1 col-span-2"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Send to Kitchen Prep</span>
                      </button>
                    )}

                    {order.order_status === 'Preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Ready')}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1 col-span-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Order Ready</span>
                      </button>
                    )}

                    {order.order_status === 'Ready' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1 col-span-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Delivered & Paid</span>
                      </button>
                    )}

                    {order.order_status === 'Delivered' && (
                      <span className="col-span-2 text-center py-2 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                        ✓ Order Delivered & Completed
                      </span>
                    )}

                    {order.order_status === 'Cancelled' && (
                      <span className="col-span-2 text-center py-2 text-xs font-bold text-rose-800 bg-rose-50 rounded-xl border border-rose-200">
                        Order Cancelled
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
