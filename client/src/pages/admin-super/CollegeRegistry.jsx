import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Edit3, X, AtSign, Mail, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import Input from '../../components/ui/Input';

export default function CollegeRegistry() {
  const [colleges, setColleges] = useState([]);
  const [stats, setStats] = useState({ totals: { colleges: 0, users: 0, gigs: 0, payoutVolume: 0 } });
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ name: '', emailDomain: '', designatedAdminEmail: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [collegesRes, statsRes] = await Promise.all([
        api.get('/admin/super/colleges'),
        api.get('/admin/super/stats'),
      ]);
      setColleges(collegesRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load college registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveCollege = async () => {
    try {
      await api.put(`/admin/super/colleges/${editingId}`, form);
      setEditingId('');
      setForm({ name: '', emailDomain: '', designatedAdminEmail: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update college.');
    }
  };

  const openEdit = (college) => {
    setEditingId(college._id);
    setForm({
      name: college.name,
      emailDomain: college.emailDomain,
      designatedAdminEmail: college.designatedAdminEmail,
    });
  };

  return (
    <div className="page-content">
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6">
          <p className="eyebrow mb-2">College Registry</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Colleges &amp; Designated Admins</h1>
          <p className="text-slate-500">Manage all registered campus networks on the platform.</p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading college registry...
          </div>
        )}
        {error && <div className="alert-error mb-4">{error}</div>}

        {/* Table */}
        {!loading && colleges.length > 0 && (
          <div className="card overflow-hidden p-0">
            {/* Header */}
            <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>College</span>
              <span>Domain</span>
              <span>Admin Email</span>
              <span>Admin Status</span>
              <span />
            </div>
            <div className="divide-y divide-slate-50">
              {colleges.map((college, i) => (
                <motion.div
                  key={college._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{college.name}</span>
                  </div>
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <AtSign className="w-3 h-3 text-slate-400" />{college.emailDomain}
                  </span>
                  <span className="text-sm text-slate-500 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{college.designatedAdminEmail}</span>
                  </span>
                  <span className="text-sm">
                    {college.adminUserId ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {college.adminUserId.name || 'Registered'}
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium text-xs">Not yet registered</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => openEdit(college)}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!loading && !colleges.length && (
          <div className="card text-center py-12">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No colleges registered yet.</p>
          </div>
        )}
      </AnimatedSection>

      {/* Edit modal */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            key="edit-college-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setEditingId('')}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">Edit College</h2>
                <button
                  onClick={() => setEditingId('')}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 mb-5">
                <Input id="college-name" label="College name" value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
                <Input id="college-domain" label="Email domain" value={form.emailDomain}
                  onChange={(e) => setForm((c) => ({ ...c, emailDomain: e.target.value }))}
                  placeholder="university.edu" />
                <Input id="admin-email" label="Designated admin email" type="email" value={form.designatedAdminEmail}
                  onChange={(e) => setForm((c) => ({ ...c, designatedAdminEmail: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button className="btn-primary flex-1" type="button" onClick={saveCollege}>Save Changes</button>
                <button className="btn-secondary" type="button" onClick={() => setEditingId('')}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
