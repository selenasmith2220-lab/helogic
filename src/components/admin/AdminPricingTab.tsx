import React, { useState } from 'react';
import { Crown, DollarSign, CheckCircle2, Save, RotateCcw, Sparkles, Tag, Layers } from 'lucide-react';
import { SubscriptionPlan } from '../../types';
import { saveStoredSubscriptionPlans } from '../../utils/storage';
import { INITIAL_SUBSCRIPTION_PLANS } from '../../data/initialData';

interface AdminPricingTabProps {
  plans: SubscriptionPlan[];
  onUpdatePlans: (updatedPlans: SubscriptionPlan[]) => void;
}

export const AdminPricingTab: React.FC<AdminPricingTabProps> = ({ plans, onUpdatePlans }) => {
  const [editablePlans, setEditablePlans] = useState<SubscriptionPlan[]>(plans);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePriceChange = (id: string, newPrice: number) => {
    setEditablePlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: Math.max(0, newPrice) } : p))
    );
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setEditablePlans((prev) => prev.map((p) => ({ ...p, currency: newCurrency })));
  };

  const handleTogglePlan = (id: string) => {
    setEditablePlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  const handleTitleChange = (id: string, newName: string) => {
    setEditablePlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleBadgeChange = (id: string, newBadge: string) => {
    setEditablePlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, badge: newBadge } : p))
    );
  };

  const handleSave = () => {
    saveStoredSubscriptionPlans(editablePlans);
    onUpdatePlans(editablePlans);
    setSuccessMessage('VIP subscription plan prices & settings saved and published successfully!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset subscription pricing plans back to original factory defaults?')) {
      setEditablePlans(INITIAL_SUBSCRIPTION_PLANS);
      saveStoredSubscriptionPlans(INITIAL_SUBSCRIPTION_PLANS);
      onUpdatePlans(INITIAL_SUBSCRIPTION_PLANS);
      setSuccessMessage('Subscription pricing reset to defaults.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-100" />
            <h3 className="font-extrabold text-base sm:text-lg">Dynamic Payment Plan Manager</h3>
          </div>
          <p className="text-xs text-amber-100 mt-1">
            Change your VIP subscription prices at any time. Changes apply live to all users across Chat Nexu immediately.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            id="save-pricing-plans-btn"
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:bg-amber-50 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-amber-600" />
            <span>Save & Publish Live</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Global Currency Selection */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Display Currency
          </h4>
          <p className="text-xs text-slate-500">
            Set the default currency symbol displayed on user pricing cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['$', '€', '£', '₵', 'KSh', '₦', 'CAD $'].map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => handleCurrencyChange(curr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                editablePlans[0]?.currency === curr
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Config Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {editablePlans.map((plan) => (
          <div
            key={plan.id}
            className={`p-5 rounded-2xl border-2 bg-white shadow-xs flex flex-col justify-between transition-all ${
              plan.isEnabled ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {plan.id.toUpperCase()} PLAN
                </span>

                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.isEnabled}
                    onChange={() => handleTogglePlan(plan.id)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Active</span>
                </label>
              </div>

              {/* Plan Title */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => handleTitleChange(plan.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                />
              </div>

              {/* Price Editor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price Amount ({plan.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-amber-700 text-base">
                    {plan.currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.10"
                    value={plan.price}
                    onChange={(e) => handlePriceChange(plan.id, parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border-2 border-amber-300 text-lg font-black text-slate-900 bg-amber-50/20 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Billed once per {plan.durationDays} day(s) access
                </span>
              </div>

              {/* Badge Tag */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Highlight Badge</label>
                <input
                  type="text"
                  value={plan.badge || ''}
                  placeholder="e.g. BEST VALUE"
                  onChange={(e) => handleBadgeChange(plan.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700"
                />
              </div>

              {/* Features preview */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  Included Features ({plan.features.length})
                </label>
                <ul className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Live Preview:</span>
              <span className="font-extrabold text-slate-900">
                {plan.currency}{plan.price.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
