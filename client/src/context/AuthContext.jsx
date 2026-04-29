import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../firebase/config";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileIssue, setProfileIssue] = useState(null);

  const refreshProfile = async () => {
    if (!auth.currentUser) {
      setUser(null);
      setProfileIssue(null);
      return null;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      setProfileIssue(null);
      return data;
    } catch (error) {
      const status = error.response?.status;

      if (status === 404) {
        setUser(null);
        setProfileIssue({
          type: "missing_profile",
          title: "This account is not linked to a Campus GIG profile yet.",
          message:
            "Firebase signed you in, but this account has no profile in the app database yet. Usual fixes: (1) Use the Register page once with the same email and password (it completes MongoDB signup even if Firebase already exists). (2) Designated college admin: in Super Admin → College Registry, the college’s email domain must match your address (e.g. user@grietcollege.com requires domain grietcollege.com), and Designated admin must be exactly this email with the admin slot still empty. (3) Confirm the API on Render uses the same MongoDB where the college was created. (4) Super admin accounts need SUPER_ADMIN_EMAIL on the server to match this email.",
        });
        return null;
      }

      if (!error.response) {
        setUser(null);
        setProfileIssue({
          type: "api_unreachable",
          title: "Cannot reach the API (browser “network error”)",
          message:
            "This is almost always CORS or a wrong API URL. On Render, set CLIENT_URL to this exact page origin (copy from the address bar, e.g. https://your-app.vercel.app). If you use Vercel preview links, add CORS_ALLOW_VERCEL=true on Render or list each preview URL in CLIENT_URL (comma-separated). Open your Render /api/health URL first to wake the service, then retry.",
        });
        return null;
      }

      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextFirebaseUser) => {
      setLoading(true);
      setFirebaseUser(nextFirebaseUser);

      if (!nextFirebaseUser) {
        setUser(null);
        setProfileIssue(null);
        setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch (error) {
        if (error.response?.status === 401) {
          await signOut(auth);
          setUser(null);
          setProfileIssue(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setProfileIssue(null);
  };

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      user,
      loading,
      profileIssue,
      refreshProfile,
      setUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
