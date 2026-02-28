import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export const AdminAuthContext = createContext();

function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setAdmin(user);
      setLoading(false);
    });
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export default AdminAuthProvider;
