import React, { useEffect, useState } from 'react';
import { Award, Gift, Plus, Search, ShieldCheck, RefreshCw, Sparkles, User, Coins, Check } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { loyaltyApi } from '../../services/api';

export const AdminLoyaltyPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Points Adjustment Modal State
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [adjustPhone, setAdjustPhone] = useState('');
  const [adjustName, setAdjustName] = useState('');
  const [pointsChange, setPointsChange] = useState(50);
  const [adjustDesc, setAdjustDesc] = useState('Bonus Loyalty Reward');

  // Reward Creation Modal State
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardName, setRewardName] = useState('');
  const [pointsRequired, setPointsRequired] = useState(100);
  const [discountAmount, setDiscountAmount] = useState(149);

  const fetchLoyaltyData = () => {
    loyaltyApi.getAdminCustomers().then((res) => {
      setCustomers(res.data);
      setLoading(false);
    }).catch(console.error);

    loyaltyApi.getRewards().then((res) => {
      setRewards(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const openAdjustModal = (c?: any) => {
    if (c) {
      setAdjustPhone(c.phone);
      setAdjustName(c.name);
    } else {
      setAdjustPhone('');
      setAdjustName('');
    }
    setPointsChange(50);
    setAdjustDesc('Bonus Loyalty Reward');
    setShowPointsModal(true);
  };

  const handleAdjustPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPhone || !pointsChange) return;

    loyaltyApi.adminAdjustPoints(adjustPhone, adjustName, pointsChange, adjustDesc).then(() => {
      setShowPointsModal(false);
      fetchLoyaltyData();
    }).catch(console.error);
  };

  const handleCreateRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardName || !pointsRequired) return;

    loyaltyApi.adminCreateReward(rewardName, pointsRequired, discountAmount).then(() => {
      setShowRewardModal(false);
      setRewardName('');
      fetchLoyaltyData();
    }).catch(console.error);
  };

  const tierBadge = (tier: string) => {
    switch (tier) {
      case 'Platinum': return <span className="bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">🏆 Platinum</span>;
      case 'Gold': return <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">🌟 Gold</span>;
      case 'Silver': return <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">🥈 Silver</span>;
      default: return <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-0.5 rounded-full text-[10px]">🥉 Bronze</span>;
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-bold text-cafe-950">
              Customer Loyalty & Rewards Manager
            </h1>
            <p className="text-xs text-cafe-600 mt-0.5">Manage customer rewards points balances, tiers, and redeemable catalog options.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowRewardModal(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-amber-300 transition-colors"
            >
              + Add Reward Option
            </button>
            <button
              onClick={() => openAdjustModal()}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1"
            >
              <Coins className="w-4 h-4" />
              <span>Credit Bonus Points</span>
            </button>
          </div>
        </div>

        {/* Rewards Catalog Cards */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-lg font-bold text-cafe-950 flex items-center space-x-2">
              <Gift className="w-5 h-5 text-pink-600" />
              <span>Active Redeemable Rewards Catalog</span>
            </h2>
            <span className="text-xs text-cafe-500 font-medium">Earning Rule: 10 Points for every ₹100 Spent</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((r) => (
              <div key={r.id} className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 space-y-1 shadow-sm">
                <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {r.points_required} Points Needed
                </span>
                <h3 className="font-bold text-cafe-950 text-base mt-1">{r.reward_name}</h3>
                <p className="text-xs text-emerald-700 font-bold">Discount Value: ₹{r.discount_amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Loyalty Table */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-serif text-xl font-bold text-cafe-950 flex items-center space-x-2">
              <Award className="w-6 h-6 text-amber-600" />
              <span>Customer Points Database ({customers.length} Members)</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-cafe-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search phone or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cafe-50 border border-amber-300 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-amber-700">Loading loyalty database...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-cafe-950">
                <thead className="bg-cafe-950 text-amber-200 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4">Current Points</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-4 font-bold text-cafe-950">{c.name}</td>
                      <td className="p-4 font-semibold text-amber-900">{c.phone}</td>
                      <td className="p-4">{tierBadge(c.tier)}</td>
                      <td className="p-4 font-bold text-emerald-800">₹{c.total_spent}</td>
                      <td className="p-4">
                        <span className="bg-amber-100 text-amber-950 font-bold px-3 py-1 rounded-full text-xs border border-amber-300">
                          🪙 {c.points_balance} Pts
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openAdjustModal(c)}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          + Adjust Points
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ADJUST POINTS MODAL */}
        {showPointsModal && (
          <div className="fixed inset-0 z-50 bg-cafe-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleAdjustPointsSubmit} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-amber-200">
              <h3 className="font-serif text-lg font-bold text-cafe-950 border-b pb-3">Credit / Deduct Points</h3>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Customer Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={adjustPhone}
                  onChange={(e) => setAdjustPhone(e.target.value)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={adjustName}
                  onChange={(e) => setAdjustName(e.target.value)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Points Change (+ or -)</label>
                <input
                  type="number"
                  required
                  placeholder="+50 or -20"
                  value={pointsChange}
                  onChange={(e) => setPointsChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Reason / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birthday Bonus / Festival Gift"
                  value={adjustDesc}
                  onChange={(e) => setAdjustDesc(e.target.value)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPointsModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Update Points
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ADD REWARD OPTION MODAL */}
        {showRewardModal && (
          <div className="fixed inset-0 z-50 bg-cafe-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleCreateRewardSubmit} className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-amber-200">
              <h3 className="font-serif text-lg font-bold text-cafe-950 border-b pb-3">Add Loyalty Reward Option</h3>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Reward Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Belgian Chocolate Shake"
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Points Required *</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={pointsRequired}
                  onChange={(e) => setPointsRequired(parseInt(e.target.value) || 100)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cafe-800 uppercase mb-1">Discount Value (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-cafe-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Save Reward
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
