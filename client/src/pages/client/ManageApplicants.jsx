import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ExternalLink, UserCheck, Bookmark, BookmarkCheck, Users, CheckCircle, XCircle } from 'lucide-react';
import api, { applicationsFromResponse } from '../../services/api';
import Badge from '../../components/ui/Badge';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function ManageApplicants() {
  const { gigId } = useParams();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(() => new Set());

  const loadApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/gig/${gigId}`, { params: { limit: 100 } });
      setApplications(applicationsFromResponse(res.data));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApplicants(); }, [gigId]);

  const selectedApplication = applications.find((a) => a.status === 'selected');

  const handleSelect = async (applicationId) => {
    try {
      await api.put(`/applications/${applicationId}/select`);
      await loadApplicants();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to select this applicant.');
    }
  };

  const handleReview = async (applicationId, action) => {
    try {
      await api.put(`/applications/${applicationId}/review`, { action });
      await loadApplicants();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to review delivery.');
    }
  };

  const toggleShortlist = (id) =>
    setShortlisted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="page-content">
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6">
          <p className="eyebrow mb-2">Applicants</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Move from shortlist energy to one clear owner.
          </h1>
          <p className="text-slate-500">
            Shortlisting is local to your session. Final selection and delivery review are persisted through the backend.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading applicants...
          </div>
        )}
        {!loading && error && <div className="alert-error mb-4">{error}</div>}
        {!loading && !applications.length && (
          <div className="card text-center py-12">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No student applications yet.</p>
            <p className="text-slate-400 text-sm mt-1">Applications from students will appear here once submitted.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {applications.map((app, i) => {
            const isShortlisted = shortlisted.has(app._id);
            const isSelected = app.status === 'selected';

            return (
              <motion.article
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`bg-white rounded-2xl border shadow-card p-5 flex flex-col gap-4 ${
                  isSelected ? 'border-primary-200 ring-2 ring-primary-100' : 'border-slate-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-btn-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {app.studentId?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{app.studentId?.name}</p>
                      <p className="text-xs text-slate-400">{app.studentId?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isShortlisted && (
                      <span className="badge-blue text-xs">Shortlisted</span>
                    )}
                    <Badge status={app.status} />
                  </div>
                </div>

                {/* Rating + portfolio */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {app.studentId?.ratings?.average || 0}/5
                  </span>
                  <Link
                    to={`/portfolio/${app.studentId?._id}`}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    View Portfolio →
                  </Link>
                </div>

                {/* Cover note */}
                {app.coverNote && (
                  <p className="text-sm text-slate-600 italic bg-slate-50 rounded-xl p-3 border border-slate-100">
                    &quot;{app.coverNote}&quot;
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleShortlist(app._id)}
                    className={isShortlisted ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
                  >
                    {isShortlisted ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                  </button>
                  {!selectedApplication && (
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => handleSelect(app._id)}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Select
                    </button>
                  )}
                </div>

                {/* Delivery block */}
                {isSelected && app.deliveryFileUrl && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="eyebrow mb-2">Delivery Submitted</p>
                    {app.deliveryNote && (
                      <p className="text-sm text-slate-600 mb-3">{app.deliveryNote}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <a
                        href={app.deliveryFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary btn-sm flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Submission
                      </a>
                      <button
                        className="btn-primary btn-sm"
                        type="button"
                        onClick={() => handleReview(app._id, 'accept')}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        className="btn-ghost btn-sm"
                        type="button"
                        onClick={() => handleReview(app._id, 'reject')}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </AnimatedSection>
    </div>
  );
}
