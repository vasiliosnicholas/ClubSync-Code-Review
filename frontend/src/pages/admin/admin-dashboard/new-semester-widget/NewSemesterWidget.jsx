import { Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useUser } from "../../../../context/UserContext.jsx";
import { useToast } from "../../../../context/ToastContext.jsx";
import SemesterCard from "./SemesterCard.jsx";
import SemesterAckModal from "./SemesterAckModal.jsx";
import NewSemesterModal from "./NewSemesterModal.jsx";

export default function NewSemesterWidget({ onSemesterStarted }) {
  const { user, setUser } = useUser();
  const { showToast } = useToast();

  const [active, setActive] = useState(null);
  const [showAck, setShowAck] = useState(false);
  const [ackText, setAckText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.groupId) return;
    const loadClub = async () => {
      try {
        const res = await fetch(`/api/groups/${user.groupId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        setActive(await res.json());
      } catch (err) {
        console.error("Failed to load your club", err);
      }
    };
    loadClub();
  }, [user?.groupId]);

  const openAck = () => {
    setAckText("");
    setShowAck(true);
  };

  const closeAck = () => {
    setShowAck(false);
  };

  const continueFromAck = () => {
    setShowAck(false);
    setName("");
    setError("");
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    if (submitting) return;
    setShowConfirm(false);
  };

  // resets the club in place: the club keeps its id, so staff stay attached and
  // only the join code, name, and dues reset.
  const startSemester = async () => {
    const semesterName = name.trim();
    if (!semesterName) {
      setError("A semester name is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/groups/semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: semesterName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.message ?? "Could not start a new semester.";
        setError(message);
        showToast(message, "danger");
        return;
      }
      const data = await res.json(); // { name, joinCode }
      setActive((prev) => ({
        ...prev,
        name: data.name,
        joinCode: data.joinCode,
      }));
      setUser({ ...user, duesStatus: "not_submitted", duesTier: "null" });
      setShowConfirm(false);
      showToast("New semester started successfully!");
      // tell the dashboard to refetch its stats + pending list (same club id,
      // so their own effects wouldn't otherwise re-run).
      if (onSemesterStarted) onSemesterStarted();
    } catch (err) {
      console.error("Failed to start new semester", err);
      showToast("Failed to start new semester", "danger");
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.groupId) return null;

  return (
    <Col xs={12} md={12} lg={12} className="role-card dues-stat-widget">
      <SemesterCard active={active} onStart={openAck} />
      <SemesterAckModal
        show={showAck}
        ackText={ackText}
        setAckText={setAckText}
        onHide={closeAck}
        onContinue={continueFromAck}
      />
      <NewSemesterModal
        show={showConfirm}
        name={name}
        setName={setName}
        submitting={submitting}
        error={error}
        onHide={closeConfirm}
        onConfirm={startSemester}
      />
    </Col>
  );
}

NewSemesterWidget.propTypes = {
  onSemesterStarted: PropTypes.func,
};
