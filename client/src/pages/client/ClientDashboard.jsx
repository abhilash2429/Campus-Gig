import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Clock, DollarSign, Users, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import AnimatedSection from '../../components/ui/AnimatedSection';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ClientDashboard() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/gigs');
        setGigs(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your gigs.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingDelivery = gigs.filter((g) => g.status === 'pending_delivery').length;

  const statCards = [
    {
      icon: Briefcase, label: 'Total Gigs', value: gigs.length,
      desc: 'Everything posted so far', color: 'text-primary-500', bg: 'bg-primary-50',
    },
    {
      icon: Clock, label: 'Pending Delivery', value: pendingDelivery,
      desc: 'Awaiting your review', color: 'text-amber-500', bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="page-content">
      {/* Hero */}
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6 bg-mesh relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-50 to-transparent rounded-3xl pointer-events-none" />
          <p className="eyebrow mb-3">Client / Faculty Console</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 max-w-xl">
            Post briefs, shortlist talent, and drive the gig to payment.
          </h1>
          <p className="text-slate-500 max-w-lg mb-6">
            Your dashboard keeps the whole commissioning workflow in one place — from pending approval to payout request.
          </p>
          <Link to="/client/post-gig" className="btn-primary btn-lg inline-flex">
            <Plus className="w-4 h-4" /> Post a Gig <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={0.1}>
        <motion.div
          variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          {statCards.map((s) => (
            <motion.div key={s.label} variants={itemVariants} className="card">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-4xl font-bold text-slate-900 tracking-tight mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-slate-700">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* Gig board */}
      <AnimatedSection delay={0.15}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <h2 className="text-base font-semibold text-slate-800">Your Gig Board</h2>
          </div>
          <Link to="/client/post-gig" className="btn-ghost btn-sm">
            <Plus className="w-3.5 h-3.5" /> New Gig
          </Link>
        </div>

        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading your gig board...
          </div>
        )}
        {!loading && error && <div className="alert-error mb-4">{error}</div>}
        {!loading && !gigs.length && (
          <div className="card text-center py-12">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No gigs posted yet.</p>
            <p className="text-slate-400 text-sm mt-1">Launch your first brief to find campus talent.</p>
            <Link to="/client/post-gig" className="btn-primary btn-sm mt-4 inline-flex">
              <Plus className="w-3.5 h-3.5" /> Post a Gig
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gigs.map((gig, i) => (
            <motion.article
              key={gig._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge status={gig.status} />
                <span className="chip">{gig.category}</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 leading-snug">{gig.title}</h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{gig.description}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  {formatCurrency(gig.budget)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> due {formatDate(gig.deadline)}
                </span>
                {gig.applicantCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {gig.applicantCount} applicant{gig.applicantCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap pt-1 border-t border-slate-50 mt-auto">
                {['open', 'in_progress', 'pending_delivery'].includes(gig.status) && (
                  <Link className="btn-secondary btn-sm" to={`/client/gig/${gig._id}/applicants`}>
                    <Users className="w-3.5 h-3.5" /> Applicants
                  </Link>
                )}
                {gig.status === 'pending_delivery' && (
                  <Link className="btn-primary btn-sm" to={`/client/gig/${gig._id}/pay`}>
                    Pay &amp; Complete
                  </Link>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
