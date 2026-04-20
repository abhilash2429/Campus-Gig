import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserX, Users, Mail } from 'lucide-react';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/college/pending-users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load pending users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleReview = async (userId, action) => {
    const reason = action === 'reject' ? window.prompt('Reason for rejection?', '') || '' : '';
    try {
      await api.put(`/admin/college/users/${userId}/review`, { action, reason });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this user.');
    }
  };

  return (
    <div className="page-content">
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6">
          <p className="eyebrow mb-2">Pending Users</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">User Approval Queue</h1>
          <p className="text-slate-500">Review and approve or reject student and faculty registrations.</p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading pending users...
          </div>
        )}
        {!loading && error && <div className="alert-error mb-4">{error}</div>}
        {!loading && !users.length && (
          <div className="card text-center py-12">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No pending users right now.</p>
            <p className="text-slate-400 text-sm mt-1">All registrations are up to date.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, i) => (
            <motion.article
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-btn-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" />{user.email}
                  </p>
                </div>
              </div>
              <span className="chip capitalize w-fit">{user.role.replace('_', ' ')}</span>
              {user.role === 'client' && user.clientProfile ? (
                <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Client Verification</p>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Affiliation:</span> {user.clientProfile.affiliationType}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Organization:</span> {user.clientProfile.organizationName || 'Not provided'}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Target College:</span> {user.clientProfile.targetCollegeId?.name || user.collegeId?.name || 'Not selected'}
                  </p>
                  {user.clientProfile.idProofUrl ? (
                    <a
                      href={user.clientProfile.idProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary-700 font-medium hover:underline"
                    >
                      Open {user.clientProfile.idProofLabel || 'ID proof'}
                    </a>
                  ) : (
                    <p className="text-sm text-rose-600">No ID proof link provided.</p>
                  )}
                </div>
              ) : null}
              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  className="btn-primary btn-sm flex-1 flex items-center gap-1.5 justify-center"
                  onClick={() => handleReview(user._id, 'approve')}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  type="button"
                  className="btn-danger btn-sm flex items-center gap-1.5"
                  onClick={() => handleReview(user._id, 'reject')}
                >
                  <UserX className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
