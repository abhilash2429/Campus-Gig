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
            "If you used a college email from an unregistered college, your sign-in worked in Firebase but the campus account was never created in the app.",
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
