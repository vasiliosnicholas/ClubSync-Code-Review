import NavBar from "./navbar/NavBar.jsx";
import { useState, useEffect } from "react";
import { UserContext } from "../../context/UserContext.jsx";
import PropTypes from "prop-types";

export default function BasePage({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="app-content-layout">
        <NavBar />

        <main role="main">{children}</main>

        <footer className="mt-5" role="contentinfo">
          <hr />
          <p className="text-center">ClubSync. All Rights Reserved</p>
        </footer>
      </div>
    </UserContext.Provider>
  );
}

BasePage.propTypes = {
  children: PropTypes.node,
};
