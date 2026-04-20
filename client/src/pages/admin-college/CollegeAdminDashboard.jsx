import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CollegeAdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, gigs: 0, payouts: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [users, gigs, payouts] = await Promise.all([
          api.get('/admin/college/pending-users'),
          api.get('/admin/college/pending-gigs'),
          api.get('/admin/college/pending-payouts'),
        ]);
        setCounts({ users: users.data.length, gigs: gigs.data.length, payouts: payouts.data.length });
      } catch {
        setCounts({ users: 0, gigs: 0, payouts: 0 });
      }
    };
    load();
  }, []);

  const queueCards = [
    {
      icon: Users, label: 'Pending Users', value: counts.users,
      desc: 'Registrations awaiting approval', to: '/admin/college/users',
      color: 'text-primary-500', bg: 'bg-primary-50', ring: 'ring-primary-100',
    },
    {
      icon: Briefcase, label: 'Pending Gigs', value: counts.gigs,
      desc: 'New briefs requiring sign-off', to: '/admin/college/gigs',
      color: 'text-violet-500', bg: 'bg-violet-50', ring: 'ring-violet-100',
    },
    {
      icon: DollarSign, label: 'Pending Payouts', value: counts.payouts,
      desc: 'Verified payments awaiting release', to: '/admin/college/payouts',
      color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-100',
    },
  ];

  return (
    <div className="page-content">
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6 bg-mesh relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-50 to-transparent rounded-3xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-btn-primary flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <p className="eyebrow">College Admin</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 max-w-xl">
            Approve the people, gigs, and payouts that keep your campus credible.
          </h1>
          <p className="text-slate-500 max-w-lg">
            Your review queue is the trust layer between demand and student execution.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <motion.div
          variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {queueCards.map((card) => (
            <motion.div key={card.label} variants={itemVariants}>
              <Link
                to={card.to}
                className={`bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col gap-3 
                  hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 block
                  ${card.value > 0 ? `ring-2 ${card.ring}` : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  {card.value > 0 && (
                    <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {card.value}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{card.value}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{card.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-primary-600 mt-auto">
                  Review queue <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>
    </div>
  );
}
