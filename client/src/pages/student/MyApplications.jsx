import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, FileText, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/applications/my');
        setApplications(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your applications.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page-content">
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6">
          <p className="eyebrow mb-2">Application Tracker</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Keep an eye on every brief you chased.
          </h1>
          <p className="text-slate-500">
            Status changes here mirror the live gig lifecycle from application to delivery.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading your applications...
          </div>
        )}
        {!loading && error && <div className="alert-error mb-4">{error}</div>}
        {!loading && !applications.length && (
          <div className="card text-center py-12">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No applications yet.</p>
            <p className="text-slate-400 text-sm mt-1">Browse open gigs and send your first application.</p>
            <Link to="/student/gigs" className="btn-primary btn-sm mt-4 inline-flex">
              Browse Gigs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app, i) => (
            <motion.article
              key={app._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge status={app.status} label={`App: ${app.status}`} />
                {app.gigId?.status && <Badge status={app.gigId.status} label={`Gig: ${app.gigId.status?.replace(/_/g, ' ')}`} />}
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900 leading-snug">
                  {app.gigId?.title || 'Untitled Gig'}
                </h2>
                {app.coverNote && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2 italic">
                    &quot;{app.coverNote}&quot;
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {app.gigId?.budget && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-500" />
                    {formatCurrency(app.gigId.budget)}
                  </span>
                )}
                {app.gigId?.deadline && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Due {formatDate(app.gigId.deadline)}
                  </span>
                )}
              </div>

              {app.status === 'selected' && app.gigId?.status === 'in_progress' && (
                <Link
                  to={`/student/deliver/${app._id}`}
                  className="btn-primary btn-sm w-full text-center"
                >
                  Submit Delivery <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </motion.article>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
