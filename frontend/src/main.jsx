import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./styles/base.css";
import "./styles/status-badge.css";
import "./styles/dues-card.css";
import "./styles/widget.css";
import ProtectedRoute from "./pages/auth/ProtectedRoute.jsx";
import BasePage from "./pages/basepage/BasePage.jsx";
import HomePage from "./pages/homepage/HomePage.jsx";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import RegisterLandingPage from "./pages/auth/register/RegisterLandingPage.jsx";
import RegisterMemberPage from "./pages/auth/register/RegisterMemberPage.jsx";
import RegisterAdminPage from "./pages/auth/register/RegisterAdminPage.jsx";
import MemberDashboard from "./pages/member/member-dashboard/MemberDashboard.jsx";
import TreasurerDashboard from "./pages/treasurer/treasurer-dashboard/TreasurerDashboard.jsx";
import AdminEventManagement from "./pages/admin/admin-event-management/AdminEventManagement.jsx";
import EventList from "./pages/events/event-list/EventList.jsx";
import DuesStatus from "./pages/member/dues-status/DuesStatus.jsx";
import EventForm from "./pages/events/event-form/EventForm.jsx";
import EventDetail from "./pages/events/event-detail/EventDetail.jsx";
import ReviewDues from "./pages/treasurer/dues-verification/ReviewDues.jsx";
import EventEditForm from "./pages/events/event-edit/EventEditForm.jsx";
import AdminEventDetail from "./pages/admin/admin-event-management/admin-event-detail/AdminEventDetail.jsx";
import MyRsvps from "./pages/events/my-rsvps/MyRsvps.jsx";
import MembersPage from "./pages/admin/member-management/MembersPage.jsx";
import AdminDashboard from "./pages/admin/admin-dashboard/AdminDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <BasePage>
        <Routes>
          {/* User is not signed in yet (Guest Pages) */}
          <Route path="/register" element={<RegisterLandingPage />} />
          <Route path="/register/member" element={<RegisterMemberPage />} />
          <Route path="/register/admin" element={<RegisterAdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />

          {/* Member Role Pages */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/member/member-dashboard"
              element={<MemberDashboard />}
            />
            <Route
              path="/member/events"
              element={
                <>
                  <title>Events · ClubSync</title>
                  <EventList />
                </>
              }
            />
            <Route path="/member/events/:id" element={<EventDetail />} />
            <Route path="/member/my-rsvps" element={<MyRsvps />} />
            <Route path="/member/dues-status" element={<DuesStatus />} />
          </Route>

          {/* Treasurer Role Pages */}
          <Route element={<ProtectedRoute allow={["treasurer", "admin"]} />}>
            <Route
              path="/treasurer/treasurer-dashboard"
              element={<TreasurerDashboard />}
            />
            <Route path="/treasurer/review-dues" element={<ReviewDues />} />
          </Route>

          {/* Admin Role Pages */}
          <Route element={<ProtectedRoute allow={["admin"]} />}>
            <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/event-management"
              element={<AdminEventManagement />}
            />
            <Route path="/admin/members" element={<MembersPage />} />
            <Route
              path="/admin/event-form"
              element={
                <>
                  <title>Create Event · ClubSync</title>
                  <EventForm />
                </>
              }
            />
            <Route
              path="/admin/event-management/:id"
              element={<AdminEventDetail />}
            />
            <Route
              path="/admin/event-management/:id/edit"
              element={<EventEditForm />}
            />
          </Route>
        </Routes>
      </BasePage>
    </BrowserRouter>
  </StrictMode>
);
