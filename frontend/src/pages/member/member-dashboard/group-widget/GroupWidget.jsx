import { Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserContext.jsx";
import GroupCard from "./GroupCard.jsx";
import LeaveClubModal from "./LeaveClubModal.jsx";

// Member dashboard widget that shows the club/semester the member currently
// belongs to.
export default function GroupWidget() {
  const { user, setUser } = useUser();
  const [group, setGroup] = useState(null);
  const [showLeave, setShowLeave] = useState(false);
  const [ackText, setAckText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.groupId) return;
    const loadGroup = async () => {
      try {
        const res = await fetch(`/api/groups/${user.groupId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        setGroup(await res.json());
      } catch (err) {
        console.error("Failed to load group", err);
      }
    };
    loadGroup();
  }, [user?.groupId]);

  const openLeave = () => {
    setAckText("");
    setError("");
    setShowLeave(true);
  };

  const closeLeave = () => {
    if (submitting) return;
    setShowLeave(false);
  };

  const confirmLeave = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/groups/leave", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Could not leave the club.");
        return;
      }
      setUser({ ...user, groupId: null });
      setGroup(null);
      setShowLeave(false);
    } catch (err) {
      console.error("Failed to leave club", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Col xs={12} md={6} lg={6} className="role-card member-dues-widget">
      <GroupCard group={group} onLeave={openLeave} />
      <LeaveClubModal
        show={showLeave}
        groupName={group?.name}
        ackText={ackText}
        setAckText={setAckText}
        submitting={submitting}
        error={error}
        onHide={closeLeave}
        onConfirm={confirmLeave}
      />
    </Col>
  );
}
