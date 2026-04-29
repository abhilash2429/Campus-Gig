import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, Edit3, X, BookOpen, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import Input from '../../components/ui/Input';

function StarRating({ value = 0, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
      <span className="ml-1.5 text-sm text-slate-500">{Number(value).toFixed(1)}</span>
    </div>
  );
}

export default function Portfolio() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  const isOwnPortfolio = user?._id != null && String(user._id) === String(userId);

  const loadPortfolio = async () => {
    try {
      const res = await api.get(`/portfolio/${userId}`);
      setProfile(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load portfolio.');
    }
  };

  useEffect(() => { loadPortfolio(); }, [userId]);

  const handleSave = async () => {
    try {
      await api.put(`/portfolio/item/${editingId}`, draft);
      setEditingId('');
      setDraft({ title: '', description: '' });
      await loadPortfolio();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update portfolio item.');
    }
  };

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="page-content">
      {/* Profile hero */}
      <AnimatedSection>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-btn-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <p className="eyebrow mb-1">Portfolio</p>
              <h1 className="text-2xl font-bold text-slate-900">
                {profile?.name || 'Student'}&apos;s proof-of-work archive.
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Every completed gig can become a polished public artifact with clean descriptions and file links.
              </p>
              {profile?.ratings && (
                <div className="flex items-center gap-3 mt-3">
                  <StarRating value={profile.ratings.average} />
                  <span className="text-xs text-slate-400">
                    {profile.ratings.count} rating{profile.ratings.count !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {error && <div className="alert-error mb-4">{error}</div>}

      <AnimatedSection delay={0.1}>
        {!profile?.portfolioItems?.length ? (
          <div className="card text-center py-12">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No portfolio items yet.</p>
            <p className="text-slate-400 text-sm mt-1">
              Complete a gig delivery to automatically add it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.portfolioItems.map((item, i) => (
              <motion.article
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex flex-col gap-3"
              >
                <p className="eyebrow">Portfolio Item</p>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 leading-snug">
                    {item.title || 'Untitled delivery'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-3">
                    {item.description || 'No description yet.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-50 flex-wrap">
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost btn-sm flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open File
                    </a>
                  )}
                  {isOwnPortfolio && (
                    <button
                      type="button"
                      className="btn-secondary btn-sm flex items-center gap-1.5"
                      onClick={() => {
                        setEditingId(item._id);
                        setDraft({ title: item.title || '', description: item.description || '' });
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </AnimatedSection>

      {/* Edit modal */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            key="edit-modal"
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
                <h2 className="text-lg font-bold text-slate-900">Edit Portfolio Item</h2>
                <button
                  onClick={() => setEditingId('')}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 mb-5">
                <Input
                  id="portfolio-title"
                  label="Title"
                  value={draft.title}
                  onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))}
                />
                <Input
                  id="portfolio-description"
                  label="Description"
                  as="textarea"
                  value={draft.description}
                  onChange={(e) => setDraft((c) => ({ ...c, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button className="btn-primary flex-1" type="button" onClick={handleSave}>Save Changes</button>
                <button className="btn-secondary" type="button" onClick={() => setEditingId('')}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
