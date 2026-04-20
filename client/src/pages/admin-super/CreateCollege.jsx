import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, AtSign, Mail, ArrowLeft, Plus } from 'lucide-react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import Input from '../../components/ui/Input';

export default function CreateCollege() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', emailDomain: '', designatedAdminEmail: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((c) => ({ ...c, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/admin/super/colleges', form);
      navigate('/admin/super/colleges');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create college.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content max-w-xl mx-auto">
      <AnimatedSection>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Registry
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-btn-primary flex items-center justify-center mb-5 shadow-btn-glow">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <p className="eyebrow mb-2">Create College</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Open a new campus lane.
          </h1>
          <p className="text-slate-500 text-sm">
            Set the right domain and designated admin owner to activate this college on the platform.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="alert-error">{error}</div>}

            <Input
              id="new-college-name"
              label="College name"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. GRIET College of Engineering"
              required
            />

            <div className="field-group">
              <label htmlFor="new-college-domain" className="input-label flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-slate-400" /> Email domain
              </label>
              <input
                id="new-college-domain"
                value={form.emailDomain}
                onChange={set('emailDomain')}
                placeholder="grietcollege.com"
                className="input"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Students &amp; faculty with this domain will be auto-matched to this college.
              </p>
            </div>

            <div className="field-group">
              <label htmlFor="new-admin-email" className="input-label flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Designated admin email
              </label>
              <input
                id="new-admin-email"
                type="email"
                value={form.designatedAdminEmail}
                onChange={set('designatedAdminEmail')}
                placeholder="admin@grietcollege.com"
                className="input"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                This email will be automatically promoted to college_admin on first registration.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary btn-lg w-full"
              id="create-college-btn"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create College
                </span>
              )}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
}
