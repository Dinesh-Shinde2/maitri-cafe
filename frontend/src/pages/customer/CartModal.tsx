import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ordersApi, loyaltyApi } from '../../services/api';

interface CartModalProps {
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { cart, tableNumber, qrToken, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loyaltyProfile, setLoyaltyProfile] = useState<any | null>(null);
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [redeemedRewardName, setRedeemedRewardName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (customerPhone.trim().length < 10) {
      setLoyaltyProfile(null);
      setAppliedDiscount(0);
      setRedeemedRewardName('');
      return;
    }

    loyaltyApi
      .getCustomer(customerPhone.trim())
      .then((res) => {
        setLoyaltyProfile(res.data);
        if (res.data.name && res.data.name !== 'Valued Guest') {
          setCustomerName(res.data.name);
        }
      })
      .catch(console.error);

    loyaltyApi.getRewards().then((res) => setRewardsList(res.data)).catch(console.error);
  }, [customerPhone]);

  const handleRedeemReward = (reward: any) => {
    if (!customerPhone) return;
    loyaltyApi
      .redeem(customerPhone, reward.id)
      .then((res) => {
        setAppliedDiscount(res.data.discount_amount);
        setRedeemedRewardName(res.data.reward_name);
        setLoyaltyProfile((prev: any) => ({
          ...prev,
          points_balance: res.data.remaining_points,
        }));
      })
      .catch((err) => {
        alert(err.response?.data?.detail || 'Failed to redeem reward');
      });
  };

  const finalAmount = Math.max(0, totalAmount - appliedDiscount);
  const estimatedEarnedPoints = Math.floor(finalAmount / 100) * 10;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber || !qrToken) {
      setErrorMsg('Invalid table session. Scan the table QR again.');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Cart is empty');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Phone number required for order updates');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    ordersApi
      .placeOrder({
        table_number: tableNumber,
        qr_token: qrToken,
        customer_name: customerName || `Guest @ Table ${tableNumber}`,
        customer_phone: customerPhone,
        notes,
        items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      })
      .then((res) => {
        clearCart();
        onClose();
        navigate(`/order/status/${res.data.id}`);
      })
      .catch(() => {
        setErrorMsg('Could not place order. Try again.');
        setSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden border border-paper-line bg-paper-card shadow-soft animate-fade-up">
        <div className="flex items-center justify-between border-b border-paper-line bg-ink px-5 py-4 text-paper">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-moss-300" />
            <h2 className="font-display text-lg font-semibold">Table {tableNumber} · Cart</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-paper/70 hover:text-paper" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {errorMsg && (
              <div className="border border-copper/40 bg-copper/10 px-3 py-2 text-xs text-ink-soft">
                {errorMsg}
              </div>
            )}

            <ul className="space-y-2">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center gap-3 border border-paper-line bg-paper px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-ink-mute">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <div className="inline-flex items-center border border-paper-line">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center hover:bg-moss-50">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center bg-moss-600 text-paper hover:bg-moss-500">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="p-1.5 text-ink-mute hover:text-copper">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <label className="block text-xs font-medium text-ink-mute">
              Kitchen notes
              <input
                className="field mt-1"
                placeholder="Less spicy, extra cheese…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-ink-mute">
                Phone *
                <input
                  className="field mt-1"
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </label>
              <label className="block text-xs font-medium text-ink-mute">
                Name
                <input
                  className="field mt-1"
                  placeholder="Guest name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </label>
            </div>

            {loyaltyProfile && (
              <div className="border border-moss-200 bg-moss-50 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{loyaltyProfile.points_balance} pts</p>
                    <p className="text-[11px] text-ink-mute">{loyaltyProfile.tier} · +{estimatedEarnedPoints} this order</p>
                  </div>
                </div>
                {rewardsList.map((reward) => {
                  const canRedeem = loyaltyProfile.points_balance >= reward.points_required;
                  return (
                    <div key={reward.id} className="flex items-center justify-between gap-2 border border-paper-line bg-paper px-2.5 py-2 text-xs">
                      <div>
                        <p className="font-semibold text-ink">{reward.reward_name}</p>
                        <p className="text-ink-mute">{reward.points_required} pts · ₹{reward.discount_amount} off</p>
                      </div>
                      <button
                        type="button"
                        disabled={!canRedeem}
                        onClick={() => handleRedeemReward(reward)}
                        className={`px-2.5 py-1 font-semibold ${
                          canRedeem ? 'bg-moss-600 text-paper' : 'bg-paper-line text-ink-mute'
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-1 border border-paper-line bg-paper px-3 py-3 text-xs text-ink-soft">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-moss-700">
                  <span>{redeemedRewardName}</span>
                  <span>−₹{appliedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-paper-line pt-2 font-display text-sm font-semibold text-ink">
                <span>Total</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-paper-line p-4">
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? 'Placing…' : 'Place order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
