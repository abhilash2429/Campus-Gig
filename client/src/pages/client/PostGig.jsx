import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, DollarSign, Calendar, Tag, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import Input from '../../components/ui/Input';

const CATEGORIES = ['Design', 'Development', 'Research', 'Video', 'Writing'];

export default function PostGig() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Design',
    budget: '', deadline: '', targetCollegeId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((c) => ({ ...c, [key]: e.target.value }));

  useEffect(() => {
    if (user?.collegeId) return;
    api.get('/public/colleges').then((r) => setColleges(r.data)).catch(() => setColleges([]));
  }, [user?.collegeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/gigs', { ...form, budget: Number(form.budget) });
      navigate('/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create this gig.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content max-w-2xl mx-auto">
      <AnimatedSection>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-colors"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-5">
          <p className="eyebrow mb-2">Post a Gig</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Write the brief like someone great will read it.
          </h1>
          <p className="text-slate-500 text-sm">
            Every new gig starts in pending approval and becomes visible to students after admin review.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="alert-error">{error}</div>}

            {/* Title */}
            <Input
              id="gig-title"
              label="Gig Title"
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Design a poster for the tech fest"
              required
            />

            {/* Description */}
            <div className="field-group">
              <label htmlFor="gig-description" className="input-label">Description</label>
              <textarea
                id="gig-description"
                value={form.description}
                onChange={set('description')}
                placeholder="Describe the deliverables, scope, tools, and how you'll judge completion..."
                className="input min-h-[140px] resize-vertical"
                required
              />
            </div>

            {/* Category + Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="field-group">
                <label htmlFor="gig-category" className="input-label flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
                </label>
                <div className="relative">
                  <select
                    id="gig-category"
                    value={form.category}
                    onChange={set('category')}
                    className="input appearance-none pr-9"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="gig-budget" className="input-label flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Budget (INR)
                </label>
                <input
                  id="gig-budget"
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={set('budget')}
                  placeholder="e.g. 2000"
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Deadline + College */}
            <div className="grid grid-cols-2 gap-4">
              <div className="field-group">
                <label htmlFor="gig-deadline" className="input-label flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline
                </label>
                <input
                  id="gig-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={set('deadline')}
                  className="input"
                  required
                />
              </div>
              {!user?.collegeId && (
                <div className="field-group">
                  <label htmlFor="target-college" className="input-label flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Target College
                  </label>
                  <div className="relative">
                    <select
                      id="target-college"
                      value={form.targetCollegeId}
                      onChange={set('targetCollegeId')}
                      className="input appearance-none pr-9"
                      required
                    >
                      <option value="">Select a college</option>
                      {colleges.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary btn-lg w-full mt-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting for Review...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Create Gig
                </span>
              )}
            </button>
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
}
