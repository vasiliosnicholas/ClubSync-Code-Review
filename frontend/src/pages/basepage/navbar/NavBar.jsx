import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import BSNavLink from "react-bootstrap/NavLink";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useUser } from "../../../context/UserContext.jsx";
import { ROLE_ACCESS } from "./roleTabs.js";
import GlassesIcon from "../../../components/icons/GlassesIcon.jsx";
import LogoutIcon from "../../../components/icons/LogoutIcon.jsx";
import PersonIcon from "../../../components/icons/PersonIcon.jsx";
import "./navbar.css";

const ROLE_VIEWS = ["member", "treasurer", "admin"];

const NAV_PAGES = {
  guest: [],
  member: [
    { to: "/member/member-dashboard", label: "Dashboard" },
    { to: "/member/dues-status", label: "Dues" },
    { to: "/member/events", label: "Events" },
    { to: "/member/my-rsvps", label: "My RSVPs" },
  ],
  treasurer: [
    { to: "/treasurer/treasurer-dashboard", label: "Dashboard" },
    { to: "/treasurer/review-dues", label: "Dues Review" },
  ],
  admin: [
    { to: "/admin/admin-dashboard", label: "Dashboard" },
    { to: "/admin/event-management", label: "Event Management" },
    { to: "/admin/members", label: "Club Members" },
  ],
};

export default function NavBar() {
  const { user, setUser } = useUser();
  const [groupName, setGroupName] = useState("Unknown");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const segment = pathname.split("/")[1];
  const view = ROLE_VIEWS.includes(segment) ? segment : "guest";
  const pages = NAV_PAGES[view] ?? NAV_PAGES.guest;

  const availableViews = [];
  for (let tab = ROLE_ACCESS[user?.role]?.[0]; tab; tab = tab.children?.[0]) {
    availableViews.push(tab);
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }

    setUser(null);
    setExpanded(false);
    navigate("/");
  };

  useEffect(() => {
    if (!user?.groupId) return;
    const getGroupName = async () => {
      try {
        const res = await fetch(`/api/groups/${user.groupId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const group = await res.json();
        setGroupName(group.name);
      } catch (error) {
        console.error("Failed return group name", error);
      }
    };
    getGroupName();
  }, [user?.groupId]);

  return (
    <Navbar
      expand="lg"
      variant="dark"
      className="top-navbar"
      role="navigation"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid className="top-navbar-container">
        <Navbar.Toggle aria-controls="top-navbar-nav" />

        <Navbar.Brand
          as={NavLink}
          to="/"
          className="top-navbar-brand top-navbar-brand-mobile"
        >
          ClubSync
        </Navbar.Brand>

        <Navbar.Collapse id="top-navbar-nav" className="top-navbar-collapse">
          {pages.length > 0 && (
            <Nav className="top-navbar-links">
              {pages.map((page) => (
                <Nav.Link
                  as={NavLink}
                  to={page.to}
                  key={page.to}
                  end={page.to === "/"}
                  onClick={() => setExpanded(false)}
                >
                  {page.label}
                </Nav.Link>
              ))}
            </Nav>
          )}

          <Navbar.Brand
            as={NavLink}
            to="/"
            className="top-navbar-brand top-navbar-brand-desktop"
          >
            ClubSync
          </Navbar.Brand>

          <Nav className="top-navbar-actions">
            {user ? (
              <>
                {availableViews.length > 1 && (
                  <Dropdown>
                    <Dropdown.Toggle
                      as={BSNavLink}
                      id="view-switch-dropdown"
                      aria-haspopup="true"
                      className="nav-standout-pill nav-standout-pill-gold"
                    >
                      <GlassesIcon />
                      {`${view.charAt(0).toUpperCase()}${view.slice(1)} View`}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {availableViews.map((tab) => (
                        <Dropdown.Item
                          as={NavLink}
                          to={tab.to}
                          key={tab.role}
                          onClick={() => setExpanded(false)}
                        >
                          {tab.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as={BSNavLink}
                    id="user-menu-dropdown"
                    aria-haspopup="true"
                    className="nav-standout-pill nav-standout-pill-orange"
                  >
                    <PersonIcon />
                    {`${user.firstName}`}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.ItemText className="nav-user-role-item">
                      <div><strong>Club</strong>{`: ${groupName}`}</div>
                      <div><strong>Role</strong>{`: ${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`}</div>
                    </Dropdown.ItemText>
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="nav-logout-item"
                    >
                      <LogoutIcon />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <Nav className="top-navbar-guest-pill">
                <Nav.Link
                  as={NavLink}
                  to="/login"
                  onClick={() => setExpanded(false)}
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={NavLink}
                  to="/register"
                  onClick={() => setExpanded(false)}
                >
                  Register
                </Nav.Link>
              </Nav>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
