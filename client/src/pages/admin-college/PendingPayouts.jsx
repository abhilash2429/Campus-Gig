import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, DollarSign, User } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function PendingPayouts() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/college/pending-payouts');
      setPayments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load pending payouts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  const approvePayout = async (paymentId) => {
    try {
      await api.put(`/admin/college/payouts/${paymentId}/approve`);
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve this payout.');
    }
  };

  return (
    <div className="page-content">
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6">
          <p className="eyebrow mb-2">Pending Payouts</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payout Review Queue</h1>
          <p className="text-slate-500">Approve verified payments to release funds to students.</p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading payout requests...
          </div>
        )}
        {!loading && error && <div className="alert-error mb-4">{error}</div>}
        {!loading && !payments.length && (
          <div className="card text-center py-12">
            <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No payout requests waiting.</p>
            <p className="text-slate-400 text-sm mt-1">Approved payments will appear here for release.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {payments.map((payment, i) => (
            <motion.article
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="bg-white rounded-2xl border border-emerald-200 shadow-card p-5 flex flex-col gap-4 ring-1 ring-emerald-100"
            >
              <div className="flex items-center gap-2">
                <span className="badge-purple">Payout Requested</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 leading-snug">
                  {payment.gigId?.title || 'Unknown Gig'}
                </h2>
                <div className="flex flex-col gap-1.5 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Student: <span className="font-medium text-slate-700">{payment.studentId?.name}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Client: <span className="font-medium text-slate-700">{payment.clientId?.name}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-sm text-emerald-700 font-medium">Payout Amount</span>
                <span className="text-lg font-bold text-emerald-800">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <button
                type="button"
                className="btn-primary btn-sm w-full flex items-center gap-1.5 justify-center"
                onClick={() => approvePayout(payment._id)}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve Payout
              </button>
            </motion.article>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
