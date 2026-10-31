import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, QrCode, Star } from 'lucide-react';
import { menuApi, feedbackApi } from '../../services/api';

export const HomePage: React.FC = () => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [rating, setRating] = useState({ overall_avg: 4.8, total_reviews: 0 });

  useEffect(() => {
    menuApi.getMenu()
      .then((res) => {
        const allItems = res.data.flatMap((cat: any) => cat.items || []);
        setHighlights(allItems.slice(0, 4));
      })
      .catch(console.error);

    feedbackApi.getSummary()
      .then((res) => {
        if (res.data?.total_reviews > 0) setRating(res.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero — one composition, brand first, full-bleed image */}
      <section className="relative min-h-[88vh] overflow-hidden bg-ink text-paper">
        <img
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1800&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />

        <div className="page-shell relative flex min-h-[88vh] flex-col justify-end pb-16 pt-28 sm:pb-20">
          <p className="font-display text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl animate-fade-up">
            Maitri
          </p>
          <h1 className="mt-4 max-w-lg font-display text-2xl font-semibold leading-snug text-paper/90 sm:text-3xl animate-fade-up" style={{ animationDelay: '80ms' }}>
            A cafe for unhurried meals and people you like.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/65 sm:text-base animate-fade-up" style={{ animationDelay: '140ms' }}>
            Espresso, wood-fired plates, garden tables. Scan your seat QR when you arrive — order without waving for the waiter.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Link to="/scan" className="btn-primary bg-paper text-ink hover:bg-moss-100">
              <QrCode className="h-4 w-4" />
              Scan table QR
            </Link>
            <Link to="/book-table" className="btn-secondary border-paper/25 bg-transparent text-paper hover:border-paper hover:bg-paper/5">
              Book a table
            </Link>
          </div>
        </div>
      </section>

      {/* Scan explainer — one job */}
      <section className="border-b border-paper-line bg-paper-card">
        <div className="page-shell grid gap-10 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="section-label">At your table</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
              Order starts with a scan
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-mute sm:text-base">
              Every table prints a unique QR. Scanning verifies your seat, opens the live menu, and routes water, waiter, and bill requests to staff — no shared Wi‑Fi app, no guessing table numbers.
            </p>
            <Link to="/scan" className="btn-primary mt-6">
              Open scanner
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-moss-900">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80"
              alt="Dining room"
              className="h-full w-full object-cover opacity-90"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-ink/80 p-4 text-sm text-paper/85 backdrop-blur-sm">
              Camera reads QR → token check → table session → kitchen ticket
            </div>
          </div>
        </div>
      </section>

      {/* Menu strip */}
      <section className="page-shell py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">From the kitchen</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-ink">On the menu</h2>
          </div>
          <Link to="/menu" className="btn-ghost text-moss-600">
            Full menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, i) => (
            <article
              key={item.id}
              className="group animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-moss-100">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <h3 className="font-semibold text-ink">{item.name}</h3>
                <span className="text-sm font-medium text-moss-600">₹{item.price}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-ink-mute">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Celebrations — one purpose */}
      <section className="bg-moss-900 text-paper">
        <div className="page-shell grid gap-8 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="section-label text-moss-300">Private evenings</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Birthdays, anniversaries, small gatherings
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-paper/65">
              Decor, cake, and set menus planned with you — rooftop or indoor. Tell us the date; we handle the rest.
            </p>
            <Link to="/celebration" className="btn-primary mt-6 bg-paper text-ink hover:bg-moss-100">
              Plan a celebration
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=900&q=80"
            alt="Rooftop terrace"
            className="aspect-[5/4] w-full object-cover"
          />
        </div>
      </section>

      {/* Rating + book */}
      <section className="page-shell py-16">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-paper-line pt-12 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-1 text-moss-600">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-moss-500 text-moss-500" />
              ))}
            </div>
            <p className="mt-2 font-display text-2xl font-semibold text-ink">
              {rating.overall_avg} average
              {rating.total_reviews > 0 ? ` · ${rating.total_reviews} reviews` : ''}
            </p>
            <p className="mt-1 text-sm text-ink-mute">Guests come for the food. Stay for the quiet corners.</p>
          </div>
          <Link to="/book-table" className="btn-primary">
            Check tables & reserve
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
