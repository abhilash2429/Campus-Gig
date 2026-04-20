import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Briefcase, DollarSign, Clock, Tag } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function PendingGigs() {
  const [gigs, setGigs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadGigs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/college/pending-gigs');
      setGigs(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load pending gigs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGigs(); }, []);

  const handleReview = async (gigId, action) => {
    try {
      await api.put(`/admin/college/gigs/${gigId}/review`, { action });
      setGigs((prev) => prev.filter((g) => g._id !== gigId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this gig.');
    }
  };

  return (
    <div className="page-content">
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6">
          <p className="eyebrow mb-2">Pending Gigs</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gig Approval Queue</h1>
          <p className="text-slate-500">Review new briefs posted to your campus before they go live to students.</p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading pending gigs...
          </div>
        )}
        {!loading && error && <div className="alert-error mb-4">{error}</div>}
        {!loading && !gigs.length && (
          <div className="card text-center py-12">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No pending gigs right now.</p>
            <p className="text-slate-400 text-sm mt-1">All gig submissions are reviewed.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gigs.map((gig, i) => (
            <motion.article
              key={gig._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="bg-white rounded-2xl border border-amber-200 shadow-card p-5 flex flex-col gap-4 ring-1 ring-amber-100"
            >
              <div className="flex items-center gap-2">
                <span className="badge-amber">Pending Review</span>
                <span className="chip flex items-center gap-1"><Tag className="w-3 h-3" />{gig.category}</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 leading-snug">{gig.title}</h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{gig.description}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />{formatCurrency(gig.budget)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />Due {formatDate(gig.deadline)}
                </span>
              </div>
              <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                Posted by <span className="font-medium text-slate-600">{gig.postedBy?.name}</span>{' '}
                ({gig.postedBy?.role?.replace('_', ' ')})
              </p>
              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  className="btn-primary btn-sm flex-1 flex items-center gap-1.5 justify-center"
                  onClick={() => handleReview(gig._id, 'approve')}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  type="button"
                  className="btn-danger btn-sm flex items-center gap-1.5"
                  onClick={() => handleReview(gig._id, 'reject')}
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
