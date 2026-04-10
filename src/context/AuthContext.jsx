import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

const SUPER_ADMIN_EMAIL = 'elchelpo2325@gmail.com';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null); // 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch status and role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const isSuper = user.email === SUPER_ADMIN_EMAIL;
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Merge auth user with firestore data
          setCurrentUser({ ...user, ...data });
          setUserStatus(data.status || 'pending');
        } else {
          // Fallback for super admin if no doc exists yet
          if (isSuper) {
            setCurrentUser({ ...user, role: 'admin', status: 'approved' });
            setUserStatus('approved');
          } else {
            setCurrentUser(user);
            setUserStatus('pending');
          }
        }
      } else {
        setCurrentUser(null);
        setUserStatus(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (name, email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    
    // Create user doc in Firestore as pending and regular user
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      status: 'pending',
      role: 'user', // Default role
      createdAt: new Date().toISOString()
    });
    
    return res;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      
      // Create user doc in Firestore if it doesn't exist
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          status: 'approved',
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
      return res;
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      alert("Error de inicio de sesión: " + error.message + ".\n\nVerifica que 'Google' esté habilitado en Firebase y que el dominio actual esté en la lista de 'Authorized Domains'.");
    }
  };

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;
  const isAdmin = isSuperAdmin || currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userStatus, 
      isAdmin,
      isSuperAdmin,
      signup, 
      login, 
      loginWithGoogle,
      logout, 
      resetPassword,
      loading 
    }}>
      {loading ? (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
          <div className="loader"></div>
          <p style={{ marginTop: '20px', fontWeight: 600, letterSpacing: '1px' }}>Iniciando sistema seguro...</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
