import NavBar from "./navbar/NavBar.jsx";
import { useState, useEffect, useCallback } from "react";
import { UserContext } from "../../context/UserContext.jsx";
import { ToastContext } from "../../context/ToastContext.jsx";
import ToastAlert from "../../components/widget/ToastAlert.jsx";
import PropTypes from "prop-types";

export default function BasePage({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  const showToast = useCallback((message, variant = "success") => {
    setToast({ show: true, message, variant });
  }, []);

  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

  // once the base page loads, fetch the current user if applicable
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      <ToastContext.Provider value={{ showToast }}>
        <div className="app-content-layout">
          <NavBar />

          <main role="main">{children}</main>

          <footer className="mt-5" role="contentinfo">
            <hr />
            <p className="text-center">ClubSync. All Rights Reserved</p>
          </footer>
        </div>

        <ToastAlert
          show={toast.show}
          onClose={hideToast}
          message={toast.message}
          variant={toast.variant}
        />
      </ToastContext.Provider>
    </UserContext.Provider>
  );
}

BasePage.propTypes = {
  children: PropTypes.node,
};
