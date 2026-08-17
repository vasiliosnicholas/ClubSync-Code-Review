import { Navigate, Outlet } from "react-router";
import { useUser } from "../../context/UserContext.jsx";
import PropTypes from "prop-types";
//this should be handled on the backend via middleware
export default function ProtectedRoute({ allow }) {
  const { user, loading } = useUser();

  // checking session
  if (loading) return null;
  // user is logged out
  if (!user) return <Navigate to="/login" replace />;
  // logged in, wrong role
  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

ProtectedRoute.propTypes = {
  allow: PropTypes.arrayOf(PropTypes.string),
};
