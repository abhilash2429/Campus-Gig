import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';

const loadRazorpay = () =>
  new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PaymentTrigger() {
  const navigate = useNavigate();
  const { gigId } = useParams();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setStatus('');
    setError('');
    try {
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) throw new Error('Razorpay checkout could not be loaded.');

      const { data } = await api.post('/payments/create-order', { gigId });

      await new Promise((resolve, reject) => {
        let finished = false;
        const finish = () => {
          if (!finished) {
            finished = true;
            resolve();
          }
        };

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          handler: async (response) => {
            try {
              await api.post('/payments/verify', { ...response });
              setStatus('Payment verified. Gig marked complete.');
              navigate('/client');
              finish();
            } catch (err) {
              const msg = err.response?.data?.message || err.message || 'Verification failed';
              setError(msg);
              reject(err);
            }
          },
          modal: {
            ondismiss: () => finish(),
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (err) {
      setError((prev) => prev || err.response?.data?.message || err.message || 'Payment could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content max-w-lg mx-auto">
      <AnimatedSection>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="card">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-btn-primary flex items-center justify-center mb-6 shadow-btn-glow">
            <CreditCard className="w-7 h-7 text-white" />
          </div>

          <p className="eyebrow mb-2">Payment</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            One last clean handoff.
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            The sandbox flow creates a Razorpay order, verifies the callback, and opens payout review for the college admin.
          </p>

          {status && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {status}
            </motion.div>
          )}

          {error && (
            <div className="alert-error mb-5 text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl p-5 mb-5 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Payment method</span>
              <span className="font-medium text-slate-700">Razorpay (Sandbox)</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Verification</span>
              <span className="font-medium text-slate-700">Webhook + signature</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Payout flow</span>
              <span className="font-medium text-slate-700">Admin approval required</span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handlePayment}
            className="btn-primary btn-lg w-full"
            id="payment-trigger-btn"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Preparing checkout...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Create Order &amp; Pay
              </span>
            )}
          </button>
        </div>
      </AnimatedSection>
    </div>
  );
}
