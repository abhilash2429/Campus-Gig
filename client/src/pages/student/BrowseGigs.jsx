import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Clock, DollarSign, X, Send, Tag } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import AnimatedSection from '../../components/ui/AnimatedSection';
import Input from '../../components/ui/Input';

export default function BrowseGigs() {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedGig, setSelectedGig] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [gigsRes, appsRes] = await Promise.all([
        api.get('/gigs'),
        api.get('/applications/my'),
      ]);
      setGigs(gigsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load gigs right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const appliedIds = new Set(applications.map((a) => a.gigId?._id));

  const filtered = gigs.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleApply = async () => {
    if (!selectedGig) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/applications/gig/${selectedGig._id}`, { coverNote });
      setSelectedGig(null);
      setCoverNote('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      {/* Hero */}
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6">
          <p className="eyebrow mb-2">Browse Gigs</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Every approved brief from your campus lands here first.
          </h1>
          <p className="text-slate-500 mb-5">
            Apply with a short cover note and keep your profile tight, credible, and current.
          </p>
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search gigs or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Grid */}
      <AnimatedSection delay={0.1}>
        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading approved gigs...
          </div>
        )}
        {!loading && error && <div className="alert-error mb-4">{error}</div>}
        {!loading && !filtered.length && (
          <div className="card text-center py-12">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No gigs match your search.</p>
            <p className="text-slate-400 text-sm mt-1">Try a different keyword or check back later.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((gig, i) => {
            const applied = appliedIds.has(gig._id);
            return (
              <motion.article
                key={gig._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(15,23,42,0.12)' }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex flex-col gap-3 cursor-pointer"
                onClick={() => !applied && setSelectedGig(gig)}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge status={gig.status} />
                  <span className="chip flex items-center gap-1">
                    <Tag className="w-3 h-3" />{gig.category}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 mb-1 leading-snug">{gig.title}</h2>
                  <p className="text-sm text-slate-500 line-clamp-2">{gig.description}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    {formatCurrency(gig.budget)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(gig.deadline)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {gig.postedBy?.ratings?.average || 0}/5 · {gig.postedBy?.name}
                  </span>
                  <button
                    className={applied ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
                    disabled={applied}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (!applied) setSelectedGig(gig); }}
                  >
                    {applied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </AnimatedSection>

      {/* Apply modal */}
      <AnimatePresence>
        {selectedGig && (
          <motion.div
            key="apply-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setSelectedGig(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="eyebrow mb-1">Application Draft</p>
                  <h2 className="text-xl font-bold text-slate-900">{selectedGig.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatCurrency(selectedGig.budget)} · due {formatDate(selectedGig.deadline)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGig(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && <div className="alert-error mb-4">{error}</div>}

              <div className="field-group mb-5">
                <label htmlFor="cover-note" className="input-label">
                  Why are you a strong fit?
                </label>
                <textarea
                  id="cover-note"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Keep it concrete. Mention relevant coursework, tools, or past work."
                  className="input min-h-[120px] resize-vertical"
                />
              </div>

              <div className="flex gap-3">
                <button
                  className="btn-primary flex-1"
                  disabled={submitting}
                  type="button"
                  onClick={handleApply}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />Submit Application
                    </span>
                  )}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setSelectedGig(null)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
