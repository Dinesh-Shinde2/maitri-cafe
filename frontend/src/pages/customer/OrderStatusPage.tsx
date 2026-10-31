import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { ordersApi } from '../../services/api';

const STATUSES = [
  { key: 'Received', title: 'Received', desc: 'Waiting for confirmation' },
  { key: 'Confirmed', title: 'Confirmed', desc: 'Accepted by floor' },
  { key: 'Preparing', title: 'Preparing', desc: 'Kitchen working' },
  { key: 'Ready', title: 'Ready', desc: 'Plated and waiting' },
  { key: 'Delivered', title: 'Delivered', desc: 'At your table' },
];

export const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    if (!orderId) return;
    ordersApi
      .getOrderById(parseInt(orderId))
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return <div className="page-shell py-20 text-center text-sm text-ink-mute">Loading order…</div>;
  }

  if (!order) {
    return (
      <div className="page-shell py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">Order not found</h2>
        <Link to="/" className="mt-4 inline-block text-sm text-moss-600 underline-offset-2 hover:underline">Home</Link>
      </div>
    );
  }

  const currentIndex = Math.max(0, STATUSES.findIndex((s) => s.key === order.order_status));

  return (
    <div className="page-shell max-w-2xl space-y-6 py-12">
      <header className="flex flex-col gap-4 border border-paper-line bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-moss-300">Live order</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{order.order_number}</h1>
          <p className="mt-1 text-xs text-paper/60">
            Table {order.table_number} · {order.customer_name}
          </p>
        </div>
        <button type="button" onClick={fetchOrder} className="inline-flex items-center gap-1.5 border border-paper/20 px-3 py-2 text-xs font-medium hover:border-moss-300">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </header>

      <div className="border border-paper-line bg-paper-card p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">Kitchen timeline</h2>
        <ol className="relative mt-8 space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-paper-line">
          {STATUSES.map((st, idx) => {
            const done = idx <= currentIndex;
            const current = idx === currentIndex;
            return (
              <li key={st.key} className="relative flex gap-4 pl-1">
                <span
                  className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold ${
                    done ? 'bg-moss-600 text-paper' : 'border border-paper-line bg-paper text-ink-mute'
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${current ? 'text-moss-700' : 'text-ink'}`}>{st.title}</p>
                  <p className="text-xs text-ink-mute">{st.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {order.items?.length > 0 && (
        <div className="border border-paper-line bg-paper-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-mute">Items</h3>
          <ul className="mt-3 divide-y divide-paper-line text-sm">
            {order.items.map((item: any, i: number) => (
              <li key={i} className="flex justify-between py-2">
                <span>{item.quantity}× {item.name || item.menu_item_name || 'Item'}</span>
                <span className="text-ink-mute">₹{item.price ?? item.line_total ?? '—'}</span>
              </li>
            ))}
          </ul>
          {order.total_amount != null && (
            <p className="mt-3 border-t border-paper-line pt-3 text-right font-display font-semibold">
              Total ₹{order.total_amount}
            </p>
          )}
        </div>
      )}

      {order.order_status === 'Delivered' && (
        <Link
          to={`/feedback?orderId=${order.id}&table=${order.table_number}`}
          className="btn-primary w-full"
        >
          Leave feedback
        </Link>
      )}
    </div>
  );
};
