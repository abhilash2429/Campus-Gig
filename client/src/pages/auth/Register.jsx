import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  FileBadge2,
  Globe,
  GraduationCap,
  LoaderCircle,
  Paperclip,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Zap,
  BookOpen,
  Users,
  Briefcase,
} from 'lucide-react';
import { auth, storage } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Input from '../../components/ui/Input';

const ROLES = [
  { value: 'student', label: 'Student', icon: BookOpen, desc: 'Apply to gigs & build portfolio' },
  { value: 'faculty', label: 'Faculty', icon: Users, desc: 'Post gigs for your department' },
  { value: 'client', label: 'Client', icon: Briefcase, desc: 'Request approval before posting gigs' },
];

const CLIENT_AFFILIATIONS = [
  { value: 'college', label: 'College / Campus Unit', icon: GraduationCap },
  { value: 'company', label: 'Company / Startup', icon: Building2 },
];

export default function Register() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    affiliationType: 'company',
    organizationName: '',
    targetCollegeId: '',
    idProofLabel: '',
  });
  const [colleges, setColleges] = useState([]);
  const [idProofFile, setIdProofFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    if (form.role !== 'client') return;

    let active = true;
    setLoadingColleges(true);
    api.get('/public/colleges')
      .then((response) => {
        if (!active) return;
        setColleges(response.data);
        setForm((current) => ({
          ...current,
          targetCollegeId: current.targetCollegeId || response.data[0]?._id || '',
        }));
      })
      .catch(() => {
        if (!active) return;
        setColleges([]);
      })
      .finally(() => {
        if (active) setLoadingColleges(false);
      });

    return () => {
      active = false;
    };
  }, [form.role]);

  const registerWithBackend = async (token, payload) => {
    await api.post('/auth/register', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const buildRegisterPayload = ({ idProofUrl = '' } = {}) => {
    const payload = {
      name: form.name,
      role: form.role,
    };

    if (form.role === 'client') {
      payload.affiliationType = form.affiliationType;
      payload.organizationName = form.organizationName;
      payload.targetCollegeId = form.targetCollegeId;
      payload.idProofUrl = idProofUrl;
      payload.idProofLabel = form.idProofLabel;
    }

    return payload;
  };

  const uploadClientProof = async (firebaseUser) => {
    if (form.role !== 'client') {
      return '';
    }

    if (!idProofFile) {
      throw new Error('Upload your ID proof before requesting client approval.');
    }

    setUploadingProof(true);
    try {
      const safeFileName = idProofFile.name.replace(/\s+/g, '-');
      const storageRef = ref(
        storage,
        `client-verification/${firebaseUser.uid}/${Date.now()}-${safeFileName}`,
      );
      await uploadBytes(storageRef, idProofFile);
      return await getDownloadURL(storageRef);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleEmailRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      let credential;
      try {
        // Try creating a new Firebase user
        credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      } catch (firebaseErr) {
        if (firebaseErr.code === 'auth/email-already-in-use') {
          // Firebase user already exists — sign them in to get token, then register in MongoDB
          credential = await signInWithEmailAndPassword(auth, form.email, form.password);
        } else {
          throw firebaseErr;
        }
      }
      const token = await credential.user.getIdToken();
      const idProofUrl = await uploadClientProof(credential.user);
      await registerWithBackend(token, buildRegisterPayload({ idProofUrl }));
      await refreshProfile();
      navigate('/dashboard');
    } catch (registerError) {
      setError(registerError.response?.data?.message || registerError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      if (form.role !== 'client') {
        throw new Error('Choose the Client role before using Google onboarding.');
      }

      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const token = await credential.user.getIdToken();
      const idProofUrl = await uploadClientProof(credential.user);
      await registerWithBackend(token, {
        ...buildRegisterPayload({ idProofUrl }),
        name: form.name || credential.user.displayName || 'External Client',
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (registerError) {
      setError(registerError.response?.data?.message || registerError.message);
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
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-accent-purple/20" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-lg">Campus GIG</span>
            </div>

            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              Turn campus trust<br />into shipped work.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Register with your institution email for student or faculty access, or onboard as a client with proof and college targeting.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              { icon: BookOpen, title: 'Students', desc: 'Earn real money on campus' },
              { icon: Users, title: 'Faculty', desc: 'Commission student talent' },
              { icon: ShieldCheck, title: 'Clients', desc: 'Verified by the target college before posting' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <p className="eyebrow mb-2">Get started free</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">
              Already have one?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="alert-error mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailRegister} className="space-y-4">
            <Input
              id="name"
              label="Full name"
              value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
              placeholder="Arjun Sharma"
              required
            />
            <Input
              id="register-email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
              placeholder="you@university.edu"
              required
            />
            <Input
              id="register-password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
              placeholder="Minimum 8 characters"
              required
            />

            {/* Role pill toggle */}
            <div className="field-group">
              <span className="input-label">Campus role</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, role: r.value }))}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all duration-150 ${
                      form.role === r.value
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <r.icon className={`w-4 h-4 shrink-0 ${form.role === r.value ? 'text-primary-500' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-semibold">{r.label}</p>
                      <p className="text-xs opacity-70">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {form.role === 'client' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 rounded-2xl border border-primary-100 bg-primary-50/60 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">Client Verification</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tell us who you represent, which college you want to post gigs to, and upload an ID proof for review.
                  </p>
                </div>

                <div className="field-group">
                  <span className="input-label">You represent a</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {CLIENT_AFFILIATIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, affiliationType: option.value }))}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all duration-150 ${
                          form.affiliationType === option.value
                            ? 'border-primary-400 bg-white text-primary-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <option.icon className={`w-4 h-4 shrink-0 ${form.affiliationType === option.value ? 'text-primary-500' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  id="client-organization"
                  label={form.affiliationType === 'college' ? 'College / Unit Name' : 'Company Name'}
                  value={form.organizationName}
                  onChange={(e) => setForm((current) => ({ ...current, organizationName: e.target.value }))}
                  placeholder={form.affiliationType === 'college' ? 'e.g. Alumni Cell, GRIET' : 'e.g. Acme Labs Pvt Ltd'}
                  required={form.role === 'client'}
                />

                <div className="field-group">
                  <label htmlFor="target-college" className="input-label">Target college for posting gigs</label>
                  <div className="relative">
                    <select
                      id="target-college"
                      value={form.targetCollegeId}
                      onChange={(e) => setForm((current) => ({ ...current, targetCollegeId: e.target.value }))}
                      className="input appearance-none"
                      required={form.role === 'client'}
                      disabled={loadingColleges}
                    >
                      <option value="">{loadingColleges ? 'Loading colleges...' : 'Select a college'}</option>
                      {colleges.map((college) => (
                        <option key={college._id} value={college._id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="client-id-proof" className="input-label">Upload ID proof</label>
                  <label
                    htmlFor="client-id-proof"
                    className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary-200 bg-white px-4 py-3 text-sm text-slate-600 cursor-pointer hover:border-primary-300 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-primary-500" />
                      {idProofFile ? idProofFile.name : 'Choose a file from your device'}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">
                      Browse
                    </span>
                  </label>
                  <input
                    id="client-id-proof"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                    required={form.role === 'client'}
                  />
                  <p className="text-xs text-slate-500">
                    Accepted: PDF, PNG, JPG, JPEG, WEBP
                  </p>
                </div>

                <Input
                  id="client-id-label"
                  label="ID proof label"
                  value={form.idProofLabel}
                  onChange={(e) => setForm((current) => ({ ...current, idProofLabel: e.target.value }))}
                  placeholder="Employee ID, visiting card, department letter, etc."
                />
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || uploadingProof}
              className="btn-primary btn-lg w-full mt-2"
              id="register-email-btn"
            >
              {loading || uploadingProof ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  {uploadingProof ? 'Uploading ID proof...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  {form.role === 'client' ? 'Create Account & Request Approval' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-xs font-medium">or use Google for client onboarding</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <button
            type="button"
            disabled={loading || uploadingProof}
            onClick={handleGoogleRegister}
            className="btn-secondary btn-lg w-full flex items-center gap-3"
            id="register-google-btn"
          >
            <Globe className="w-4 h-4 text-primary-500" />
            {form.role === 'client' ? 'Register with Google as Client' : 'Choose Client Role for Google Onboarding'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
