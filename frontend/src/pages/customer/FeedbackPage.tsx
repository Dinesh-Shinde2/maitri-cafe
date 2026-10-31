import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Star } from 'lucide-react';
import { feedbackApi } from '../../services/api';

export const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const tableNum = searchParams.get('table');

  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [ambienceRating, setAmbienceRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [customerName, setCustomerName] = useState('');
  const [comments, setComments] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    feedbackApi
      .submitFeedback({
        order_id: orderId ? parseInt(orderId) : null,
        table_number: tableNum || undefined,
        customer_name: customerName || 'Guest',
        food_rating: foodRating,
        service_rating: serviceRating,
        ambience_rating: ambienceRating,
        cleanliness_rating: cleanlinessRating,
        comments,
        is_public: isPublic,
      })
      .then(() => {
        setSubmitting(false);
        setSubmitted(true);
      })
      .catch(() => setSubmitting(false));
  };

  const StarRow = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
    <div className="flex items-center justify-between gap-4 border border-paper-line bg-paper px-4 py-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5" aria-label={`${star} stars`}>
            <Star className={`h-5 w-5 ${star <= value ? 'fill-moss-500 text-moss-500' : 'text-paper-line'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="page-shell max-w-md py-20 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-moss-600" />
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Thank you</h1>
        <p className="mt-2 text-sm text-ink-mute">Your notes help us keep Maitri honest.</p>
        <Link to="/" className="btn-primary mt-8 inline-flex">Back home</Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <section className="border-b border-paper-line bg-moss-900 text-paper">
        <div className="page-shell py-12">
          <p className="section-label text-moss-300">After your visit</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Feedback</h1>
          <p className="mt-2 text-sm text-paper/65">
            {tableNum ? `Table ${tableNum}` : 'Tell us how the meal went.'}
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="page-shell max-w-lg space-y-4 py-10">
        <StarRow label="Food" value={foodRating} onChange={setFoodRating} />
        <StarRow label="Service" value={serviceRating} onChange={setServiceRating} />
        <StarRow label="Ambience" value={ambienceRating} onChange={setAmbienceRating} />
        <StarRow label="Cleanliness" value={cleanlinessRating} onChange={setCleanlinessRating} />

        <label className="block text-xs font-medium text-ink-mute">
          Name
          <input className="field mt-1" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </label>
        <label className="block text-xs font-medium text-ink-mute">
          Comments
          <textarea className="field mt-1" rows={4} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="What stood out?" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-moss-600" />
          Show on public reviews
        </label>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Sending…' : 'Submit feedback'}
        </button>
      </form>
    </div>
  );
};
