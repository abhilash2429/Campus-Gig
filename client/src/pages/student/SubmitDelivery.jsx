import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { storage } from '../../firebase/config';
import api from '../../services/api';
import AnimatedSection from '../../components/ui/AnimatedSection';
import Input from '../../components/ui/Input';

const uploadDelivery = async (file, gigId, applicationId) => {
  const storageRef = ref(storage, `deliveries/${gigId}/${applicationId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export default function SubmitDelivery() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/applications/${applicationId}`);
        setApplication(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load this application.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [applicationId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !application?.gigId?._id) {
      setError('Choose a delivery file before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const deliveryFileUrl = await uploadDelivery(file, application.gigId._id, application._id);
      await api.put(`/applications/${application._id}/deliver`, { deliveryFileUrl, deliveryNote });
      navigate('/student/applications');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 mb-5">
          <p className="eyebrow mb-2">Delivery</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Ship the work, then leave a clean handoff trail.
          </h1>
          <p className="text-slate-500 text-sm">
            Upload the final file to Firebase Storage and attach a note that helps the client review fast.
          </p>
        </div>

        {loading && (
          <div className="status-panel">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
            Loading delivery context...
          </div>
        )}
        {!loading && error && <div className="alert-error mb-4">{error}</div>}

        {!loading && application && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gig context card */}
            <div className="card border-l-4 border-primary-400">
              <p className="eyebrow mb-1">Gig</p>
              <h2 className="text-base font-semibold text-slate-900">{application.gigId?.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{application.gigId?.description}</p>
            </div>

            {/* File upload */}
            <div className="field-group">
              <span className="input-label">Delivery File</span>
              <label
                htmlFor="delivery-file"
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all
                  ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/50'}`}
              >
                {file ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                    <p className="text-xs text-emerald-600">Click to change file</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-600">Click to upload delivery file</p>
                    <p className="text-xs text-slate-400">Any file type supported</p>
                  </>
                )}
                <input
                  id="delivery-file"
                  type="file"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </label>
            </div>

            {/* Delivery note */}
            <div className="field-group">
              <label htmlFor="delivery-note" className="input-label flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Delivery Note
              </label>
              <textarea
                id="delivery-note"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Summarize what was delivered, how to review it, and any caveats."
                className="input min-h-[120px] resize-vertical"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !file}
              className="btn-primary btn-lg w-full"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Uploading & Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Submit Delivery
                </span>
              )}
            </button>
          </form>
        )}
      </AnimatedSection>
    </div>
  );
}
