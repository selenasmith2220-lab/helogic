import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { ChatMessage, User } from '../types';

interface ReportModalProps {
  targetUser?: User | null;
  targetMessage?: ChatMessage | null;
  currentUser: User;
  onClose: () => void;
  onSubmitReport: (reason: string, details: string) => void;
}

const REPORT_REASONS = [
  'Harassment or Hate Speech',
  'Inappropriate Photo or Sexual Content',
  'Spamming or Unsolicited Advertisements',
  'Underage User Violation',
  'Scam or Phishing Attempt',
  'Other Policy Violation',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  targetUser,
  targetMessage,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');

  const targetName = targetUser?.nickname || targetMessage?.senderName || 'User';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(selectedReason, details);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Report Violations</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-3">
          You are reporting <strong>{targetName}</strong> to the site administrators for review.
        </p>

        {targetMessage && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 italic mb-3">
            &ldquo;{targetMessage.text}&rdquo;
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Reason
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
