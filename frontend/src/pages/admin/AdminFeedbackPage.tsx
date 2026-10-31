import React, { useEffect, useState } from 'react';
import { MessageSquare, Star, RefreshCw, ThumbsUp, Quote } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { feedbackApi } from '../../services/api';

export const AdminFeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = () => {
    feedbackApi.getFeedback().then((res) => {
      setFeedbacks(res.data);
    }).catch(console.error);

    feedbackApi.getSummary().then((res) => {
      setSummary(res.data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-cafe-950">
              Customer Reviews & Feedback Dashboard
            </h1>
            <p className="text-xs text-cafe-600 mt-0.5">Inspect ratings for food quality, staff service, ambience, and cleanliness.</p>
          </div>
          <button
            onClick={fetchFeedback}
            className="flex items-center space-x-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Rating Summary Breakdown */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-cafe-950 text-amber-200 rounded-3xl p-5 border border-cafe-800 text-center col-span-2 sm:col-span-1">
              <span className="text-4xl font-bold font-serif text-amber-400">{summary.overall_avg}</span>
              <p className="text-[10px] uppercase font-bold text-amber-300 mt-1">Overall Rating</p>
              <p className="text-[10px] text-cafe-400 mt-0.5">{summary.total_reviews} Total Reviews</p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-amber-200 text-center">
              <span className="text-xl font-bold text-cafe-950">⭐ {summary.food_avg}</span>
              <p className="text-[10px] uppercase font-bold text-cafe-600 mt-1">Food Quality</p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-amber-200 text-center">
              <span className="text-xl font-bold text-cafe-950">⭐ {summary.service_avg}</span>
              <p className="text-[10px] uppercase font-bold text-cafe-600 mt-1">Staff Service</p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-amber-200 text-center">
              <span className="text-xl font-bold text-cafe-950">⭐ {summary.ambience_avg}</span>
              <p className="text-[10px] uppercase font-bold text-cafe-600 mt-1">Ambience</p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-amber-200 text-center">
              <span className="text-xl font-bold text-cafe-950">⭐ {summary.cleanliness_avg}</span>
              <p className="text-[10px] uppercase font-bold text-cafe-600 mt-1">Cleanliness</p>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="py-12 text-center text-amber-700">Loading reviews...</div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-cafe-500 border border-amber-200">
            No feedback submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-cafe-950 text-base">{fb.customer_name}</h3>
                    <p className="text-[11px] text-cafe-500">Table: {fb.table_number || 'N/A'}</p>
                  </div>

                  <div className="flex items-center space-x-1 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{fb.overall_rating} / 5.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-cafe-700 bg-cafe-50 p-2.5 rounded-xl text-center">
                  <div>Food: {fb.food_rating}★</div>
                  <div>Service: {fb.service_rating}★</div>
                  <div>Ambience: {fb.ambience_rating}★</div>
                  <div>Hygiene: {fb.cleanliness_rating}★</div>
                </div>

                {fb.comments && (
                  <p className="text-xs text-cafe-700 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    "{fb.comments}"
                  </p>
                )}

                <div className="text-[10px] text-gray-400 flex justify-between pt-1">
                  <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                  <span className="font-semibold text-amber-800">{fb.is_public ? 'Public Review' : 'Private Management Note'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
