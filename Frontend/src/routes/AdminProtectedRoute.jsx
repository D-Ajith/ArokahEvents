import { useContext } from "react";
import { AdminAuthContext } from "../context/AdminAuthContext";
import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {

  const { admin, loading } = useContext(AdminAuthContext);

  // wait until firebase checks login
  if (loading) return <h2>Checking authentication...</h2>;

  // if not logged in → go to login
  if (!admin) return <Navigate to="/admin" />;

  // if logged in → show page
  return children;
}

export default AdminProtectedRoute;
