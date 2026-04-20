import { useState } from 'react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, Globe, Star } from 'lucide-react';
import { auth } from '../../firebase/config';
import Input from '../../components/ui/Input';

const features = [
  { icon: '🎯', text: 'Apply to real campus gigs' },
  { icon: '💰', text: 'Earn and build your portfolio' },
  { icon: '⭐', text: 'Ratings that follow you for life' },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate('/');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex"
      >
        {/* Left panel */}
        <div className="hidden md:flex w-5/12 bg-auth-panel flex-col justify-between p-10 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary-500/20" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-lg">Campus GIG</span>
            </div>

            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              Log back into<br />the talent loop.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Students, faculty, clients, and admins all move through the same operational lane.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-white/80 text-sm">{f.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 mt-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
              <span className="text-white/50 text-xs ml-2">Trusted by 1,000+ students</span>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <p className="eyebrow mb-2">Welcome back</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h1>
            <p className="text-slate-500 text-sm mt-1">
              Don&apos;t have one?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="alert-error mb-5"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              id="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
              placeholder="you@university.edu"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
              placeholder="••••••••"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-lg w-full mt-2"
              id="login-email-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Continue with Email
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogle}
            className="btn-secondary btn-lg w-full flex items-center gap-3"
            id="login-google-btn"
          >
            <Globe className="w-4 h-4 text-primary-500" />
            Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
