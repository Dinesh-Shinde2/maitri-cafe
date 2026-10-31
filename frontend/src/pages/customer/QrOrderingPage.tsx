import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Droplets,
  Minus,
  Plus,
  QrCode,
  Receipt,
  Search,
  ShoppingBag,
  UserCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { tablesApi, menuApi, ordersApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { CartModal } from './CartModal';

export const QrOrderingPage: React.FC = () => {
  const { tableNumber: tableFromRoute } = useParams<{ tableNumber: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const {
    cart,
    tableNumber: activeTable,
    qrToken,
    setTableSession,
    addToCart,
    updateQuantity,
    totalItems,
    totalAmount,
  } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [sessionState, setSessionState] = useState<'loading' | 'ready' | 'invalid'>('loading');
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [serviceMsg, setServiceMsg] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);

  const tableNumber = tableFromRoute || activeTable || null;

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!tableNumber) {
        setSessionState('invalid');
        return;
      }

      const token = tokenFromUrl || (activeTable === tableNumber ? qrToken : null);
      if (!token) {
        setSessionState('invalid');
        return;
      }

      try {
        const res = await tablesApi.validateQr(tableNumber, token);
        if (cancelled) return;
        setTableSession(res.data.table_number, token);
        setTableInfo(res.data);
        setSessionState('ready');
      } catch {
        if (!cancelled) setSessionState('invalid');
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [tableNumber, tokenFromUrl, activeTable, qrToken, setTableSession]);

  useEffect(() => {
    menuApi
      .getMenu()
      .then((res) => {
        setCategories(res.data || []);
        if (res.data?.length) setActiveCategory(res.data[0].id);
        setLoadingMenu(false);
      })
      .catch(() => setLoadingMenu(false));
  }, []);

  const handleServiceRequest = (type: string) => {
    if (!tableNumber || sessionState !== 'ready') return;
    ordersApi
      .createServiceRequest(tableNumber, type)
      .then(() => {
        setServiceMsg(`${type} request sent`);
        setTimeout(() => setServiceMsg(''), 3500);
      })
      .catch(console.error);
  };

  const getQty = (itemId: number) => cart.find((i) => i.id === itemId)?.quantity || 0;

  const visibleCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories
      .filter((cat) => !activeCategory || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        items: (cat.items || []).filter(
          (item: any) => !q || item.name?.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, activeCategory, searchQuery]);

  if (sessionState === 'loading') {
    return (
      <div className="page-shell py-24 text-center text-sm text-ink-mute">
        Checking table session…
      </div>
    );
  }

  if (sessionState === 'invalid') {
    return (
      <div className="page-shell max-w-lg py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-paper-line bg-paper-card text-copper">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink">Table session required</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-mute">
          Orders only work after a valid table QR scan. This keeps bills tied to the right seat and blocks forged links.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/scan" className="btn-primary">
            <QrCode className="h-4 w-4" />
            Scan table QR
          </Link>
          <Link to="/menu" className="btn-secondary">
            Browse menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6 pb-28 pt-8">
      <header className="flex flex-col gap-4 border border-paper-line bg-ink p-5 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-moss-300">
            Table {tableNumber}
            {tableInfo?.location ? ` · ${tableInfo.location}` : ''}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Order from your seat</h1>
          <p className="mt-1 text-xs text-paper/60">Session verified. Orders go to the kitchen after admin confirm.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'Water', icon: Droplets },
            { type: 'Waiter', icon: UserCheck },
            { type: 'Bill', icon: Receipt },
          ].map(({ type, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleServiceRequest(type)}
              className="inline-flex items-center gap-1.5 border border-paper/20 px-3 py-2 text-xs font-medium text-paper/90 transition hover:border-moss-300 hover:text-moss-200"
            >
              <Icon className="h-3.5 w-3.5" />
              {type}
            </button>
          ))}
        </div>
      </header>

      {serviceMsg && (
        <div className="border border-moss-300 bg-moss-50 px-4 py-3 text-center text-xs font-semibold text-moss-800">
          {serviceMsg}
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-ink-mute" />
          <input
            className="field pl-10"
            placeholder="Search dishes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold transition ${
                activeCategory === cat.id
                  ? 'bg-moss-600 text-paper'
                  : 'border border-paper-line bg-paper-card text-ink-soft hover:border-moss-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loadingMenu ? (
        <p className="py-12 text-center text-sm text-ink-mute">Loading menu…</p>
      ) : (
        <div className="space-y-8">
          {visibleCategories.map((cat) => (
            <section key={cat.id}>
              <h2 className="border-b border-paper-line pb-2 font-display text-xl font-semibold text-ink">
                {cat.name}
              </h2>
              <div className="mt-3 divide-y divide-paper-line">
                {cat.items.map((item: any) => {
                  const qty = getQty(item.id);
                  return (
                    <div key={item.id} className="flex gap-4 py-4">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 object-cover sm:h-24 sm:w-24"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block h-2.5 w-2.5 border ${
                                  item.is_veg === false ? 'border-copper bg-copper' : 'border-moss-500 bg-moss-500'
                                }`}
                              />
                              <h3 className="text-sm font-semibold text-ink">{item.name}</h3>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-mute">
                              {item.description}
                            </p>
                            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-ink-mute">
                              <Clock className="h-3 w-3" />
                              {item.prep_time_mins || 15} min
                            </p>
                          </div>
                          <span className="shrink-0 font-display text-sm font-semibold text-moss-700">
                            ₹{item.price}
                          </span>
                        </div>

                        <div className="mt-3">
                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="inline-flex items-center gap-1 border border-moss-600 px-3 py-1.5 text-xs font-bold text-moss-700 transition hover:bg-moss-600 hover:text-paper"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add
                            </button>
                          ) : (
                            <div className="inline-flex items-center border border-moss-300 bg-moss-50">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, qty - 1)}
                                className="flex h-8 w-8 items-center justify-center text-moss-800 hover:bg-moss-100"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-[1.5rem] text-center text-xs font-bold text-ink">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, qty + 1)}
                                className="flex h-8 w-8 items-center justify-center bg-moss-600 text-paper hover:bg-moss-500"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-xl">
          <div className="flex items-center justify-between gap-3 bg-ink p-3.5 text-paper shadow-soft sm:p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center bg-moss-500 text-sm font-bold text-paper">
                {totalItems}
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-paper/50">Table {tableNumber}</p>
                <p className="font-display text-lg font-semibold">₹{totalAmount}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCartModal(true)}
              className="btn-primary !bg-moss-500 !py-2.5 !text-xs hover:!bg-moss-400"
            >
              <ShoppingBag className="h-4 w-4" />
              Review order
            </button>
          </div>
        </div>
      )}

      {showCartModal && <CartModal onClose={() => setShowCartModal(false)} />}
    </div>
  );
};
