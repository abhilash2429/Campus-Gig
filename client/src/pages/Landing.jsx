import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Zap, ArrowRight, BookOpen, Users, Briefcase, Star,
  CheckCircle, Globe, GraduationCap, DollarSign,
  Clock, Shield, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/* ── Animation helpers ──────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Static data ────────────────────────────── */
const features = [
  {
    icon: GraduationCap, color: 'text-primary-500', bg: 'bg-primary-50',
    title: 'Built for campus life',
    desc: 'College-verified emails gate each workflow. Students, faculty, and external clients each get the exact tools they need — nothing more.',
  },
  {
    icon: Shield, color: 'text-violet-500', bg: 'bg-violet-50',
    title: 'Multi-layer approval',
    desc: 'Every gig, user, and payout clears a college-admin review gate. No rogue posts, no anonymous payouts.',
  },
  {
    icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50',
    title: 'Ratings that compound',
    desc: 'Every completed delivery feeds a public star score you carry across every future gig. Reputation is the real currency.',
  },
  {
    icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50',
    title: 'Razorpay in the loop',
    desc: 'Clients pay via Razorpay. Payout goes to students only after admin sign-off. The money rail is clean, transparent, and campus-owned.',
  },
  {
    icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-50',
    title: 'Auto-portfolio on delivery',
    desc: 'When a client accepts your work, the gig is instantly added to your public portfolio. Ship code, get portfolio entries.',
  },
  {
    icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50',
    title: 'Zero admin overhead',
    desc: 'Deadline tracking, status state machine, and delivery review all run inside the app. No spreadsheets. No email chains.',
  },
];

const steps = [
  { n: '01', title: 'Post or Browse', desc: 'Clients post a brief. Students browse open gigs filtered to their college.' },
  { n: '02', title: 'Apply & Get Selected', desc: 'Students pitch with a cover note. Clients shortlist, then lock in one winner.' },
  { n: '03', title: 'Deliver & Review', desc: 'Winner uploads their work. Client reviews, accepts, or requests a re-do.' },
  { n: '04', title: 'Pay & Earn', desc: 'Client pays via Razorpay. Admin approves the payout. Student gets paid.' },
];

const personas = [
  {
    icon: BookOpen, label: 'Students',
    headline: 'Turn semester free-time into a portfolio companies want to interview.',
    points: ['Browse verified campus gigs', 'Build a starred, public portfolio', 'Get paid via Razorpay — cleanly'],
    cta: 'Start Earning', to: '/register', bg: 'bg-primary-50', border: 'border-primary-100', icon_color: 'text-primary-500',
  },
  {
    icon: Briefcase, label: 'Clients & Faculty',
    headline: 'Brief great students in under 10 minutes. Gig lives at your college.',
    points: ['Post to your campus or any campus', 'Manage applicants in one board', 'Pay only on accepted delivery'],
    cta: 'Post a Gig', to: '/register', bg: 'bg-violet-50', border: 'border-violet-100', icon_color: 'text-violet-500',
  },
];

/* ── Navbar for landing ─────────────────────── */
function LandingNav({ isLoggedIn, dashboardTo }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass border-b border-white/40">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-btn-primary flex items-center justify-center shadow-sm">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-slate-900 tracking-tight">Campus GIG</span>
      </div>
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <Link to={dashboardTo} className="btn-primary">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const roleMap = { student: '/student', faculty: '/client', client: '/client', college_admin: '/admin/college', super_admin: '/admin/super' };
  const dashboardTo = user ? (roleMap[user.role] || '/') : '/';

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingNav isLoggedIn={!!user} dashboardTo={dashboardTo} />

      {/* ── HERO ─────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-primary-100/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-32 right-0 w-72 h-72 bg-violet-100/60 rounded-full blur-3xl" />
          <div className="absolute top-64 left-0 w-56 h-56 bg-primary-100/40 rounded-full blur-3xl" />
        </div>

        <motion.div
          ref={heroRef}
          style={{ y: heroY }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider mb-8">
              <Zap className="w-3.5 h-3.5" /> Campus talent marketplace
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.08] mb-6"
          >
            Real gigs.<br />
            <span className="text-gradient">Real pay.</span><br />
            On your campus.
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Campus GIG connects verified students with faculty and external clients for paid creative, technical, and research gigs — all inside your college's trust network.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary btn-lg shadow-btn-glow">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-ghost btn-lg">
              Sign in <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="flex items-center justify-center gap-2 mt-10 text-slate-400 text-sm"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
            <span className="ml-1">Trusted by students across campuses</span>
          </motion.div>
        </motion.div>

        {/* Dashboard preview card */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 max-w-3xl mx-auto mt-16"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4 h-7 rounded-lg bg-slate-100 flex items-center px-3">
                <span className="text-xs text-slate-400 font-mono">campus-gig.app/student</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Available Gigs', value: '24', color: 'text-primary-600', bg: 'bg-primary-50' },
                { label: 'Applications', value: '7', color: 'text-violet-600', bg: 'bg-violet-50' },
                { label: 'Earnings', value: '₹4,200', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { title: 'Design a tech-fest poster', cat: 'Design', budget: '₹1,500', status: 'open' },
                { title: 'Build a React dashboard', cat: 'Development', budget: '₹3,000', status: 'in_progress' },
              ].map((gig) => (
                <div key={gig.title} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{gig.title}</p>
                    <p className="text-xs text-slate-400">{gig.cat}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-600">{gig.budget}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gig.status === 'open' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'}`}>
                      {gig.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            variants={stagger} className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="eyebrow mb-3">Why Campus GIG</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Everything a campus<br />freelance market needs.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-xl mx-auto">
              We didn't bolt freelancing onto a normal platform. We built the entire trust stack from college email verification up.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title} variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 transition-shadow hover:shadow-card-hover"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            variants={stagger} className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="eyebrow mb-3">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Four steps from brief to paid.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((step, i) => (
              <motion.div key={step.n} variants={fadeUp} custom={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-primary-200 to-transparent pointer-events-none z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-btn-primary text-white text-sm font-bold flex items-center justify-center mb-4 shadow-btn-glow">
                    {step.n}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PERSONAS ─────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            variants={stagger} className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="eyebrow mb-3">Made for everyone</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Pick your lane.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {personas.map((p) => (
              <motion.div
                key={p.label} variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`${p.bg} ${p.border} border rounded-3xl p-8 transition-all hover:shadow-card`}
              >
                <div className={`w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-5`}>
                  <p.icon className={`w-5 h-5 ${p.icon_color}`} />
                </div>
                <p className="eyebrow mb-2">{p.label}</p>
                <h3 className="text-xl font-bold text-slate-900 mb-4 leading-snug">{p.headline}</h3>
                <ul className="space-y-2 mb-6">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <Link to={p.to} className="btn-primary">
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA FOOTER ───────────────────────── */}
      <section className="py-24 px-6 bg-cta-gradient relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-500/20" />
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <motion.p variants={fadeUp} className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Get started today</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            Your campus is already full of talent.<br />Now let it get paid.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 text-lg mb-10">
            Set up takes 2 minutes. No credit card required for students.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn bg-white text-slate-900 font-bold btn-lg hover:bg-slate-50 hover:-translate-y-0.5 transition-all shadow-lg">
              Create your account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn bg-white/10 text-white border border-white/20 btn-lg hover:bg-white/20 hover:-translate-y-0.5 transition-all">
              Sign in instead
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="bg-slate-900 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-btn-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold">Campus GIG</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Campus GIG. Built for the next generation of campus talent.</p>
          <div className="flex items-center gap-5 text-slate-400 text-sm">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
