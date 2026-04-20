import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, DollarSign, Plus, ArrowRight, Globe } from 'lucide-react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import { formatCurrency } from '../../utils/formatters';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totals: { colleges: 0, users: 0, gigs: 0, payoutVolume: 0 } });

  useEffect(() => {
    api.get('/admin/super/stats')
      .then((r) => setStats(r.data))
      .catch(() => setStats({ totals: { colleges: 0, users: 0, gigs: 0, payoutVolume: 0 } }));
  }, []);

  const statCards = [
    { icon: Building2, label: 'Colleges', value: stats.totals.colleges, color: 'text-primary-500', bg: 'bg-primary-50' },
    { icon: Users,     label: 'Users',    value: stats.totals.users,    color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: Briefcase, label: 'Gigs',     value: stats.totals.gigs,     color: 'text-amber-500',  bg: 'bg-amber-50'  },
    {
      icon: DollarSign, label: 'Payout Volume',
      value: `₹${(stats.totals.payoutVolume || 0).toLocaleString('en-IN')}`,
      color: 'text-emerald-500', bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="page-content">
      {/* Hero */}
      <AnimatedSection>
        <div className="bg-cta-gradient rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-primary-500/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Super Admin</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 max-w-xl">
              Shape the network, not just a single campus lane.
            </h1>
            <p className="text-white/60 max-w-lg mb-6 text-sm">
              Register colleges, reassign designated admins, and track platform-wide throughput.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/super/colleges" className="btn bg-white text-slate-900 font-semibold hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
                <Building2 className="w-4 h-4" /> View College Registry <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/admin/super/colleges/new" className="btn bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all">
                <Plus className="w-4 h-4" /> Add College
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={0.1}>
        <motion.div
          variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((s) => (
            <motion.div key={s.label} variants={itemVariants} className="card">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-slate-700">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>
    </div>
  );
}
