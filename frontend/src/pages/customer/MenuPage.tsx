import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, QrCode, Search } from 'lucide-react';
import { menuApi } from '../../services/api';
import { useCart } from '../../context/CartContext';

export const MenuPage: React.FC = () => {
  const { tableNumber } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuApi.getMenu()
      .then((res) => {
        setCategories(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories
      .filter((cat) => activeCategory === 'all' || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        items: (cat.items || []).filter((item: any) =>
          !q ||
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, activeCategory, searchQuery]);

  return (
    <div className="pb-20">
      <section className="border-b border-paper-line bg-moss-900 text-paper">
        <div className="page-shell py-12 sm:py-16">
          <p className="section-label text-moss-300">Kitchen</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Menu</h1>
          <p className="mt-3 max-w-xl text-sm text-paper/70">
            Browse dishes anytime. To place an order from your seat, scan the table QR — that locks the bill to your table.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/scan" className="btn-primary bg-paper text-ink hover:bg-moss-100">
              <QrCode className="h-4 w-4" />
              {tableNumber ? `Order at Table ${tableNumber}` : 'Scan table to order'}
            </Link>
            {tableNumber && (
              <Link to={`/order/${tableNumber}`} className="btn-secondary border-paper/30 bg-transparent text-paper hover:border-paper hover:text-paper">
                Open table menu
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="page-shell space-y-6 py-8">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-ink-mute" />
          <input
            className="field pl-10"
            placeholder="Search coffee, pizza, desserts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold transition ${
              activeCategory === 'all'
                ? 'bg-moss-600 text-paper'
                : 'border border-paper-line bg-paper-card text-ink-soft hover:border-moss-400'
            }`}
          >
            All
          </button>
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

        {loading ? (
          <p className="py-16 text-center text-sm text-ink-mute">Loading menu…</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-mute">No dishes match that search.</p>
        ) : (
          <div className="space-y-10">
            {filtered.map((cat) => (
              <section key={cat.id}>
                <h2 className="border-b border-paper-line pb-2 font-display text-2xl font-semibold text-ink">
                  {cat.name}
                </h2>
                <ul className="mt-4 divide-y divide-paper-line">
                  {cat.items.map((item: any) => (
                    <li key={item.id} className="flex gap-4 py-4">
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
                                className={`inline-block h-2.5 w-2.5 shrink-0 border ${
                                  item.is_veg === false
                                    ? 'border-copper bg-copper'
                                    : 'border-moss-500 bg-moss-500'
                                }`}
                                title={item.is_veg === false ? 'Non-veg' : 'Veg'}
                              />
                              <h3 className="font-semibold text-ink">{item.name}</h3>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-mute">
                              {item.description}
                            </p>
                            <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-mute">
                              <Clock className="h-3 w-3" />
                              {item.prep_time_mins || 15} min
                            </p>
                          </div>
                          <p className="shrink-0 font-display text-base font-semibold text-moss-700">
                            ₹{item.price}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
