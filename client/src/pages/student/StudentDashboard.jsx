import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Send, CheckCircle, ArrowRight, TrendingUp, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ openGigs: 0, applications: 0, selected: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [gigsRes, appsRes] = await Promise.all([
          api.get('/gigs'),
          api.get('/applications/my'),
        ]);
        const apps = appsRes.data || [];
        setMetrics({
          openGigs: gigsRes.data.length,
          applications: apps.length,
          selected: apps.filter((a) => a.status === 'selected').length,
        });
      } catch {
        setMetrics({ openGigs: 0, applications: 0, selected: 0 });
      }
    };
    load();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const statCards = [
    {
      icon: Briefcase,
      label: 'Open Gigs',
      value: metrics.openGigs,
      desc: 'Campus gigs awaiting applications',
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
    {
      icon: Send,
      label: 'Applied',
      value: metrics.applications,
      desc: 'Active or historical applications',
      color: 'text-violet-500',
      bg: 'bg-violet-50',
    },
    {
      icon: CheckCircle,
      label: 'Selected',
      value: metrics.selected,
      desc: 'Applications turned into real work',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="page-content">
      {/* Hero */}
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6 bg-mesh relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-50 to-transparent rounded-3xl pointer-events-none" />
          <p className="eyebrow mb-3">Student Console</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 max-w-xl">
            Hey {firstName}, your next proof-of-work is one application away. 👋
          </h1>
          <p className="text-slate-500 max-w-lg mb-6">
            Browse approved gigs from your college, track selected work, and turn finished deliveries into
            portfolio signal.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/student/gigs" className="btn-primary btn-lg">
              <Briefcase className="w-4 h-4" />
              Browse Open Gigs
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link to={`/portfolio/${user?._id}`} className="btn-ghost btn-lg">
              <BookOpen className="w-4 h-4" />
              View Portfolio
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={0.1}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          {statCards.map((card) => (
            <motion.div key={card.label} variants={itemVariants} className="card">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-4xl font-bold text-slate-900 tracking-tight mb-1">{card.value}</p>
              <p className="text-sm font-semibold text-slate-700">{card.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* Quick actions */}
      <AnimatedSection delay={0.2}>
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <h2 className="text-base font-semibold text-slate-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/student/gigs"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                <Briefcase className="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Browse Open Gigs</p>
                <p className="text-xs text-slate-400">Find work that matches your skills</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400 ml-auto transition-colors" />
            </Link>
            <Link
              to="/student/applications"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">My Applications</p>
                <p className="text-xs text-slate-400">Track status of all your applications</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 ml-auto transition-colors" />
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
